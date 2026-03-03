async def create_order(db, payload: dict) -> dict:
    if not payload.get("items"):
        raise HTTPException(status_code=400, detail="items não pode ser vazio.")

    to_cep = sanitize_cep(payload["address"]["to_cep"])
    if len(to_cep) != 8:
        raise HTTPException(status_code=400, detail="to_cep inválido (precisa 8 dígitos).")

    payload["address"]["to_cep"] = to_cep

    items_out: list[dict[str, Any]] = []
    subtotal = 0.0

    for it in payload["items"]:
        qty = int(it.get("quantity", 1))
        if qty < 1:
            raise HTTPException(status_code=400, detail="quantity precisa ser >= 1.")

        if not it.get("sku"):
            raise HTTPException(status_code=400, detail="sku é obrigatório.")

        prod = await _load_product(db, it["product_id"])

        variation = next(
            (
                v for v in prod.get("variations", [])
                if v["sku"] == it["sku"] and v.get("active", True)
            ),
            None,
        )

        if not variation:
            raise HTTPException(
                status_code=404,
                detail=f"Variação não encontrada: {it['sku']}",
            )

        if variation["stock"] < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {it['sku']}",
            )

        unit_price = float(variation["price"])
        subtotal += unit_price * qty

        await db.products.update_one(
            {
                "_id": prod["_id"],
                "variations.sku": it["sku"],
            },
            {
                "$inc": {"variations.$.stock": -qty},
            },
        )

        items_out.append(
            {
                "product_id": str(prod["_id"]),
                "sku": it["sku"],
                "name": prod.get("name"),
                "model": variation.get("model"),
                "color": variation.get("color"),
                "size": variation.get("size"),
                "quantity": qty,
                "unit_price": unit_price,
                "weight_kg": float(variation.get("weight_kg", 0)),
                "width_cm": float(variation.get("width_cm", 0)),
                "height_cm": float(variation.get("height_cm", 0)),
                "length_cm": float(variation.get("length_cm", 0)),
            }
        )

    shipping_price = float(payload["shipping"]["price"])
    total = subtotal + shipping_price

    now = _utcnow()

    doc = {
        "status": "created",
        "payment_status": "unpaid",  
        "payment_id": None,          
        "payment_provider": None,    

        "items": items_out,
        "address": payload["address"],
        "shipping": payload["shipping"],

        "subtotal": subtotal,
        "shipping_price": shipping_price,
        "total": total,

        "melhor_envio": {
            "cart_order_ids": [],
            "checkout": None,
            "label": None,
        },

        "created_at": now,
        "updated_at": now,
    }

    res = await db.orders.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc