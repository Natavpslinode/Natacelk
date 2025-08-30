import React from 'react';
import { supabase } from '@/lib/database';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateGeneratorProps {
  userId: string;
  studentName: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  userId,
  studentName,
  onSuccess,
  onError
}) => {
  const [generating, setGenerating] = React.useState(false);

  const generateCertificate = async () => {
    setGenerating(true);
    
    try {
      // First get the certificate data from the backend
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: {
          userId,
          studentName
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create a temporary div with the certificate HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.data.certificateHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);

      // Wait a bit for fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        width: 800,
        height: 600,
        backgroundColor: 'white',
        scale: 2
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        (210 - imgHeight) / 2, // Center vertically
        imgWidth,
        imgHeight
      );

      // Download the PDF
      const fileName = `Certificado_MEPROC_${studentName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Certificate generation error:', error);
      if (onError) onError('Error al generar el certificado');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generateCertificate}
      disabled={generating}
      className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-600 transition-all flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50"
    >
      {generating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Generando PDF...</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <span>Generar Certificado PDF</span>
        </>
      )}
    </button>
  );
};

export default CertificateGenerator;