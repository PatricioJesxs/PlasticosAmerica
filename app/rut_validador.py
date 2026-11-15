import re 

def validar_rut_chileno(rut: str) -> bool:
    """Validar un Rut Chileno mediante el calculo de modulo 11 en Python """
    if not rut or not isinstance(rut,str):
        return False
    
    rut_limpio = re.sub(r'[^0-9kK]', '', rut).upper()
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
        dv_esperado = '0'
    elif resto == 10:
        dv_esperado = 'K'
    else:
        dv_esperado = str(resto)

    return dv_ingresado == dv_esperado