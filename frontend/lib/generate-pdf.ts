import jsPDF from 'jspdf';

interface OrderData {
  orderId: number;
  saddle: {
    model: string;
    leatherType: string;
    seatSize: string;
    flapLength: string;
    kneeRoll: string;
    frontGusset: string;
    rearGusset: string;
    gussetLeather: string;
    panelMaterial: string;
    treeSize: string;
    stirrupBars: string;
    billets: string;
    seatLeather: string;
    seatOption: string;
    cantleOption: string;
    skirt: string;
    kneeRollPadLeather: string;
    flapLeather: string;
    outerReinforcement: string;
    loops: string;
    panelLeather: string;
    facingFront: string;
    facingBackRear: string;
    gulletLining: string;
    stitchColor: string;
    weltColor: string;
  };
  fitter: {
    inInventory: string;
    userName: string;
    fullName: string;
    address: string;
    zipcode: string;
    state: string;
    city: string;
    country: string;
    phone: string;
    cell: string;
    currency: string;
    email: string;
  };
  price: {
    saddlePrice: number;
    tradeIn: number;
    deposit: number;
    discount: number;
    fittingEval: number;
    callFee: number;
    girth: number;
    additional: string;
    shipping: string;
    tax: string;
    total: number;
  };
  notes: string;
  serialno: string;
  orderDate: string;
}

export function generateOrderPDF(orderData: OrderData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length;
  };

  // Add header
  doc.setFontSize(16);
  doc.text(`Order #${orderData.orderId}`, margin, 20);
  doc.setFontSize(10);
  doc.text(`Order date: ${orderData.orderDate}`, margin, 30);

  // Add saddle information section
  doc.setFontSize(12);
  doc.text('Saddle Information', margin, 45);
  doc.setFontSize(10);
  let y = 55;

  // Add saddle details
  Object.entries(orderData.saddle).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    const text = `${label}: ${value}`;
    const lines = addWrappedText(text, margin, y, contentWidth);
    y += (lines * 5);
  });

  // Add fitter information section
  y += 10;
  doc.setFontSize(12);
  doc.text('Fitter Information', margin, y);
  doc.setFontSize(10);
  y += 10;

  // Add fitter details
  Object.entries(orderData.fitter).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    const text = `${label}: ${value}`;
    const lines = addWrappedText(text, margin, y, contentWidth);
    y += (lines * 5);
  });

  // Add price information section
  y += 10;
  doc.setFontSize(12);
  doc.text('Price Information', margin, y);
  doc.setFontSize(10);
  y += 10;

  // Add price details
  Object.entries(orderData.price).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    let displayValue = value;
    if (typeof value === 'number') {
      displayValue = value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    }
    const text = `${label}: ${displayValue}`;
    const lines = addWrappedText(text, margin, y, contentWidth);
    y += (lines * 5);
  });

  // Add notes section
  y += 10;
  doc.setFontSize(12);
  doc.text('Notes', margin, y);
  doc.setFontSize(10);
  y += 10;
  addWrappedText(orderData.notes, margin, y, contentWidth);

  // Add serial number
  y += 20;
  doc.text(`Serial Number: ${orderData.serialno}`, margin, y);

  return doc;
}