/**
 * Utilidades de Exportación e Impresión para AcademiaPro - Unión Jaguera FC
 */

/**
 * Exportar datos a un archivo Excel (.xlsx / .csv compatible)
 * @param {string} filename - Nombre del archivo a descargar
 * @param {string} reportTitle - Título del reporte para el encabezado
 * @param {Array<{key: string, label: string}>} columns - Definición de columnas
 * @param {Array<Object>} rows - Datos de las filas
 */
export function exportToExcel(filename, reportTitle, columns, rows) {
  if (!rows || rows.length === 0) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO');

  let csvContent = '\uFEFF'; // BOM para soporte UTF-8 en Excel
  csvContent += `UNIÓN JAGUERA FC - ACADEMIAPRO\n`;
  csvContent += `${reportTitle.toUpperCase()}\n`;
  csvContent += `Fecha de Emisión: ${dateStr}\n\n`;

  // Encabezados de columnas
  const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
  csvContent += headers + '\n';

  // Filas de datos
  rows.forEach(row => {
    const rowValues = columns.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'number') return val;
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    csvContent += rowValues.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${now.toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Imprimir o Guardar como PDF con Membrete Institucional Oficial
 * @param {string} reportTitle - Título del reporte
 * @param {string} tableHtml - HTML de la tabla de datos
 * @param {string} summaryHtml - HTML opcional con resumenes/KPIs
 */
export function printReport(reportTitle, tableHtml, summaryHtml = '') {
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Por favor permita las ventanas emergentes (popups) para imprimir el reporte.');
    return;
  }

  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(now);

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle} - Unión Jaguera FC</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #0F172A;
          margin: 0;
          padding: 0;
          font-size: 11pt;
        }
        .header-letterhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #2563EB;
          padding-bottom: 12px;
          margin-bottom: 18px;
        }
        .academy-title {
          font-size: 18pt;
          font-weight: 800;
          color: #2563EB;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .academy-subtitle {
          font-size: 9pt;
          color: #64748B;
          margin-top: 2px;
        }
        .report-title-box {
          text-align: right;
        }
        .report-name {
          font-size: 14pt;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }
        .report-date {
          font-size: 8pt;
          color: #64748B;
          margin-top: 4px;
        }
        .summary-box {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: flex;
          gap: 20px;
          font-size: 9pt;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 9.5pt;
        }
        th {
          background-color: #F1F5F9;
          color: #334155;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          border-bottom: 2px solid #CBD5E1;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #E2E8F0;
        }
        tr:nth-child(even) {
          background-color: #FAFAFA;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 8pt;
          font-weight: 700;
        }
        .badge-success { background-color: #DCFCE7; color: #15803D; }
        .badge-warning { background-color: #FEF3C7; color: #B45309; }
        .badge-danger { background-color: #FEE2E2; color: #B91C1C; }
        .badge-primary { background-color: #EFF6FF; color: #1D4ED8; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; font-weight: 700; }
        .footer-note {
          margin-top: 30px;
          border-top: 1px solid #E2E8F0;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 8pt;
          color: #94A3B8;
        }
      </style>
    </head>
    <body>
      <div class="header-letterhead">
        <div>
          <h1 class="academy-title">Unión Jaguera FC</h1>
          <div class="academy-subtitle">Escuela de Formación Deportiva — La Jagua de Ibirico, Cesar</div>
        </div>
        <div class="report-title-box">
          <div class="report-name">${reportTitle}</div>
          <div class="report-date">Emitido: ${formattedDate}</div>
        </div>
      </div>

      ${summaryHtml ? `<div class="summary-box">${summaryHtml}</div>` : ''}

      <div class="table-container">
        ${tableHtml}
      </div>

      <div class="footer-note">
        <span>AcademiaPro v1.0 — Sistema de Gestión Deportiva y Financiera</span>
        <span>Página 1 de 1</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Exportar a PDF (Reutiliza la vista de impresión formateada)
 */
export function exportToPdf(reportTitle, tableHtml, summaryHtml = '') {
  printReport(reportTitle, tableHtml, summaryHtml);
}
