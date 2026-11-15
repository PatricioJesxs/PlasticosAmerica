import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Product, Cotizacion, CotizacionItem, AuditLog, RoleEnum
from app.schemas import CotizacionCreate
from app.rut_validador import validar_rut_chileno 


router = APIRouter(prefix="/api/cotizaciones", tags=["Cotizacioens"])

@router.post("/crear")
def registrar_cotizacion(data: CotizacionCreate, request: Request, db: Session = Depends(get_db) ):
        #1. Validar Rut 
        if not validar_rut_chileno(data.rut):
            raise HTTPException(status_code=400, detail="EL RUT ingresado no es valido para Chile")


        #2. Buscar o crear Usuario
        user = db.query(User).filter(User.rut == data.rut).first()
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                rut=data.rut,       
                nombre=data.nombre,
                email=data.email,
                telefono=data.telefono,
                hashed_password="NOPASSWORD_COTIZADOR",
                role=RoleEnum.CLIENTE
            )    
            db.add(user)
            db.commit()
            db.refresh(user)

        #3. Procesar Items y Calcular Total Neto + IVA 
        total_neto = 0
        items_para_guardar = []
        for item in data.items: 
             producto = db.query(Product).filter(Product.id == item.product_id).first()
             if not producto:
                  raise HTTPException(status_code=404, detail=f"Producto con ID {item.product_id} no encontrado")
             subtotal = producto.precio_base * item.cantidad
             total_neto += subtotal

             items_para_guardar.append({
                  "product_id": producto.id,
                  "cantidad": item.cantidad,
                  "precio_unitario": producto.precio_base,

             })

        iva = int(round(total_neto * 0.19))
        total_total = total_neto + iva





        #4. Crear Cotizacion
        nueva_cotizacion = Cotizacion(  
            id=str(uuid.uuid4()),
            user_id=user.id,
            total_neto=total_neto,
            iva=iva,
            total_total=total_total
            )
        db.add(nueva_cotizacion)



        #5.Guardar Items de Cotizacion
        for item_data in items_para_guardar:
             item = CotizacionItem(
                  id=str(uuid.uuid4()),
                  cotizacion_id=nueva_cotizacion.id,
                  **item_data
             )
        db.add(item)


        #6. Registrar Log de Auditoria de Seguridad
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            user_id=user.id,
            action="CREAR_COTIZACION",
            details=f"Cotizacion creada con ID: {nueva_cotizacion.id} y Total: {total_total}",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
        db.add(audit_log)
        db.commit()

        return {
             "status": "success",
             "message": "Cotizacion creada exitosamente",
             "cotizacion_id": nueva_cotizacion.id,
             "total_neto": total_neto,
             "iva": iva,
             "total_total": total_total
        }
