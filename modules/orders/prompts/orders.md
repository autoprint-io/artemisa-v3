# Orders Prompt

Por favor IA, genera la lógica de pedidos (Order) en Firestore, con campos:
- userId
- items: array de { productId, quantity, price }
- total (numero)
- status (pending, paid, shipped)

Crea:
1) Una ruta /api/orders en Next.js con CRUD
2) Una UI en /app/(admin)/orders/page.tsx que liste y permita crear/editar
3) Usa shadcn/ui para los botones y formularios
4) Integra un "checkout" con Stripe si 'status=paid' se paga
