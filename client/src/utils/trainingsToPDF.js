import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const handleExportTrainingsToPDF = (trainings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Tytuł dokumentu
  doc.setFontSize(18);
  doc.text("Lista treningów", pageWidth / 2, 15, { align: "center" });
  doc.setFontSize(12);

  trainings.forEach((training, index) => {
    // Nagłówek treningu
    doc.setFont(undefined, "bold");
    doc.text(training.title, 14, 25 + index * 10);
    doc.setFont(undefined, "normal");

    // Podstawowe info treningu
    autoTable(doc, {
      startY: doc.lastAutoTable?.finalY || 30 + index * 10,
      head: [["Start", "Koniec", "Max uczestników", "Zapisanych"]],
      body: [
        [
          new Date(training.startTime).toLocaleString(),
          training.endTime ? new Date(training.endTime).toLocaleString() : "-",
          training.maxParticipants,
          training.signups?.length || 0,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 144, 255], textColor: 255 },
    });

    // Lista potwierdzonych uczestników
    const confirmedSignups = training.signups?.filter(
      (s) => s.status === "confirmed"
    );

    if (confirmedSignups && confirmedSignups.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [["Potwierdzeni uczestnicy"]],
        body: confirmedSignups.map((s) => [s.user?.name || s.user?.email]),
        theme: "grid",
        headStyles: { fillColor: [34, 139, 34], textColor: 255 },
      });
    }

    // Dodaj odstęp między treningami
    if (index < trainings.length - 1) {
      doc.addPage();
    }
  });

  doc.save("trainings.pdf");
};
