import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

export const generateShipmentPDF = async (trackingData) => {
  try {
    // Initialize PDF document (portrait, mm, A4 size)
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const primaryColor = [40, 80, 200]; // #2850C8 blue
    const secondaryColor = [100, 100, 100]; // Gray
    const successColor = [16, 185, 129]; // Emerald Green
    const accentColor = [241, 245, 249]; // Light Gray Background

    // 1. Header Section
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 30, 'F'); // Top banner
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AeroTrack Logistics', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 20);

    // 2. Title & QR Code Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Shipment Tracking Details', 15, 45);

    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(`MAWB: ${trackingData.awb}`, 15, 55);

    // Generate QR Code data URL
    try {
      const qrDataUrl = await QRCode.toDataURL(trackingData.awb, { errorCorrectionLevel: 'H' });
      doc.addImage(qrDataUrl, 'PNG', 160, 40, 30, 30);
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text('Scan for live tracking', 158, 73);
    } catch (e) {
      console.warn("Failed to generate QR code", e);
    }

    // 3. Summary Box
    doc.setFillColor(...accentColor);
    doc.roundedRect(15, 65, 130, 30, 3, 3, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${trackingData.origin || 'N/A'}  →  ${trackingData.destination || 'N/A'}`, 20, 75);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const pieces = trackingData.pieces ? `${trackingData.pieces} Pc(s)` : '1 Pc(s)';
    const weight = trackingData.weight || 'N/A';
    doc.text(`${pieces} | ${weight}`, 20, 83);
    
    doc.text(`Carrier: ${trackingData.carrier || 'Unknown'}`, 20, 90);

    // Status Badge
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    if (trackingData.status === 'Delivered') {
      doc.setTextColor(...successColor);
    } else {
      doc.setTextColor(...primaryColor);
    }
    doc.text(`Status: ${trackingData.status}`, 160, 80);

    if (trackingData.estimatedDelivery) {
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.text(`Expected:`, 160, 88);
        doc.text(trackingData.estimatedDelivery, 160, 93);
    }

    // 4. Flight/Journey Information Table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tracking History', 15, 115);

    const tableData = [];
    if (trackingData.events && trackingData.events.length > 0) {
        // Reverse events to show newest first, similar to standard tracking
        const reversedEvents = [...trackingData.events].reverse();
        reversedEvents.forEach(event => {
            tableData.push([
                event.time || '-',
                event.location || '-',
                event.status || '-',
                event.completed ? 'Completed' : 'Pending'
            ]);
        });
    } else {
        tableData.push(['-', '-', 'No tracking events found', '-']);
    }

    doc.autoTable({
      startY: 120,
      head: [['Date/Time', 'Location', 'Status', 'State']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Slate-50
      }
    });

    // 5. Footer
    const finalY = doc.lastAutoTable.finalY || 120;
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('Disclaimer: Flight schedules and tracking information are provided as estimates based on carrier data.', 15, finalY + 15);
    
    // Save the PDF
    const safeAwb = trackingData.awb.replace(/[^a-zA-Z0-9-]/g, '');
    doc.save(`Shipment_${safeAwb}.pdf`);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
