def sanitize_cep(value: str) -> str:
    return "".join([c for c in str(value or "") if c.isdigit()])[:8]


def sanitize_document(value: str) -> str:
    return "".join([c for c in str(value or "") if c.isdigit()])