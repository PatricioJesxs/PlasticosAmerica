import re


def normalizar_rut(rut: str) -> str:
    """Devuelve el RUT en formato 12345678-9 (sin puntos)."""
    limpio = re.sub(r"[^0-9kK]", "", rut or "").upper()
    if len(limpio) < 2:
        return limpio
    return f"{limpio[:-1]}-{limpio[-1]}"


def formatear_rut(rut: str) -> str:
    """Devuelve el RUT en formato 12.345.678-9."""
    normal = normalizar_rut(rut)
    if "-" not in normal:
        return normal
    cuerpo, dv = normal.split("-", 1)
    if not cuerpo.isdigit():
        return normal
    partes = []
    while len(cuerpo) > 3:
        partes.insert(0, cuerpo[-3:])
        cuerpo = cuerpo[:-3]
    if cuerpo:
        partes.insert(0, cuerpo)
    return ".".join(partes) + "-" + dv


def validar_rut_chileno(rut: str) -> bool:
    """Valida un RUT chileno mediante el cálculo del módulo 11."""
    if not rut or not isinstance(rut, str):
        return False

    rut_limpio = re.sub(r"[^0-9kK]", "", rut).upper()
    if len(rut_limpio) < 8:
        return False

    cuerpo = rut_limpio[:-1]
    dv_ingresado = rut_limpio[-1]

    if not cuerpo.isdigit():
        return False

    suma = 0
    multiplicador = 2
    for c in reversed(cuerpo):
        suma += int(c) * multiplicador
        multiplicador = 2 if multiplicador == 7 else multiplicador + 1

    resto = 11 - (suma % 11)
    if resto == 11:
        dv_esperado = "0"
    elif resto == 10:
        dv_esperado = "K"
    else:
        dv_esperado = str(resto)

    return dv_ingresado == dv_esperado
