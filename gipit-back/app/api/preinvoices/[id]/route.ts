// Ruta: /api/pre_invoices/[id]
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

// Define un tipo para los profesionales
interface Professional {
    id: number;
    hoursWorked: number;
    hourValue: number;
    subtotal: number;
    vat: number;
    notes?: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const preInvoice = await prisma.pre_invoices.findUnique({
      where: { id: Number(id) },
      include: {
        pre_invoice_items: {
          include: {
            candidates: true,
          },
        },
      },
    });

    if (!preInvoice) {
      return NextResponse.json({ error: 'Pre-invoice not found' }, { status: 404 });
    }

    // Procesar los detalles de la factura y los candidatos
    const candidates = preInvoice.pre_invoice_items.flatMap(item => item.candidates);
    console.log('Detalles de la factura:', preInvoice);
    console.log('Candidatos asociados:', candidates);

    return NextResponse.json({
      preInvoice,
      candidates,
    });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching data - ${error}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const { 
      estimated_date, 
      expiration_date, 
      total_value, 
      description, 
      status,
      professionals,
      company_id
    }: {
      estimated_date: string;
      expiration_date: string;
      total_value: number;
      description: string;
      status: string;
      professionals: Professional[];
      company_id: number;
    } = await req.json();

    const preInvoice = await prisma.pre_invoices.update({
      where: { id: Number(id) },
      data: {
        estimated_date: new Date(estimated_date),
        expiration_date: new Date(expiration_date),
        total_value: Number(total_value),
        description,
        status,
        company_id: Number(company_id)
      },
    });

    await prisma.pre_invoice_items.deleteMany({
      where: { pre_invoice_id: Number(id) }
    });

    if (professionals && professionals.length > 0) {
      await prisma.pre_invoice_items.createMany({
        data: professionals.map((prof: Professional) => {
          const subtotal = Number(prof.subtotal || 0);
          const vat = Number(prof.vat || 0);
          const total = subtotal + (subtotal * (vat / 100));

          return {
            pre_invoice_id: Number(id),
            candidate_id: prof.id,
            hours: Number(prof.hoursWorked || 0),
            rate: String(prof.hourValue || 0),
            total: String(total),
            description: prof.notes || '',
            service: '',
            vat: String(vat),
            subtotal: String(subtotal)
          };
        })
      });
    }

    return NextResponse.json(preInvoice);
  } catch (err) {
    console.error('Error detallado:', err);
    return NextResponse.json({ error: `Error en la actualización: ${err}` }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { action } = await req.json();

  try {
    if (action === 'reject') {
      const updatedInvoice = await prisma.pre_invoices.update({
        where: { id: Number(id) },
        data: { status: 'rechazado' },
      });
      return NextResponse.json({ message: 'Factura rechazada con éxito', updatedInvoice });
    } else if (action === 'approve') {
      const updatedInvoice = await prisma.pre_invoices.update({
        where: { id: Number(id) },
        data: { status: 'aprobado' },
      });
      return NextResponse.json({ message: 'Factura aprobada con éxito', updatedInvoice });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error al cambiar el estado de la factura:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error al cambiar el estado de la factura: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Error desconocido al cambiar el estado de la factura' }, { status: 500 });
    }
  }
}