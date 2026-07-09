/**
 * Generates a downloadable PDF report summarizing a prediction result.
 */
import jsPDF from "jspdf";

export function generatePdfReport({
  predictedClass,
  confidence,
  rawScores,
  explanation,
  disclaimer,
  requestId,
  imageDataUrl,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 56;

  // Header
  doc.setFillColor(37, 99, 235); // medical blue-600
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Skin Cancer AI Assistant", margin, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI Screening Report (Informational Only)", margin, 54);

  y = 96;
  doc.setTextColor(30, 41, 59);

  // Meta info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Report ID: ${requestId || "N/A"}`, margin, y);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 180, y);
  y += 24;

  // Image
  if (imageDataUrl) {
    try {
      const imgWidth = 160;
      const imgHeight = 160;
      doc.addImage(imageDataUrl, "JPEG", margin, y, imgWidth, imgHeight);
    } catch {
      // if image fails to embed, continue without it
    }
  }

  // Result block (to the right of the image)
  const textX = imageDataUrl ? margin + 180 : margin;
  let resultY = y + 16;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Prediction Result", textX, resultY);
  resultY += 20;

  const isMalignant = predictedClass?.toLowerCase() === "malignant";
  doc.setFontSize(20);
  doc.setTextColor(isMalignant ? 220 : 5, isMalignant ? 38 : 150, isMalignant ? 38 : 105);
  doc.text(predictedClass || "N/A", textX, resultY);
  resultY += 22;

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text(`Confidence: ${confidence}%`, textX, resultY);
  resultY += 18;

  if (rawScores) {
    Object.entries(rawScores).forEach(([label, score]) => {
      doc.text(`${label}: ${score}%`, textX, resultY);
      resultY += 16;
    });
  }

  y = Math.max(y + 180, resultY + 16);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  // Explanation
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("AI-Generated Explanation", margin, y);
  y += 18;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const explanationLines = doc.splitTextToSize(explanation || "", pageWidth - margin * 2);
  doc.text(explanationLines, margin, y);
  y += explanationLines.length * 13 + 20;

  // Disclaimer box
  if (y > 700) {
    doc.addPage();
    y = 56;
  }
  doc.setFillColor(254, 242, 242);
  const disclaimerLines = doc.splitTextToSize(disclaimer || "", pageWidth - margin * 2 - 20);
  const boxHeight = disclaimerLines.length * 13 + 24;
  doc.rect(margin, y, pageWidth - margin * 2, boxHeight, "F");
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT MEDICAL DISCLAIMER", margin + 10, y + 16);
  doc.setFont("helvetica", "normal");
  doc.text(disclaimerLines, margin + 10, y + 32);

  doc.save(`skin-ai-report-${requestId || Date.now()}.pdf`);
}