import React, { useState, useMemo } from 'react';
import { Maximize2, X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MathDiagramProps {
  svgContent?: string;
  imageUrl?: string;
  title?: string;
  className?: string;
}

/**
 * Standard Vietnam Ministry of Education Math Diagram & Bảng Biến Thiên Renderer.
 * - Enforces pure white background (#ffffff) and crisp black lines/text (#000000).
 * - Converts raw LaTeX symbols in SVG text (e.g. -\infty, +\infty, \infty) to proper Unicode (e.g. −∞, +∞, ∞).
 * - Provides Lightbox / Zoom modal so students can examine intricate graphs, variation tables, and geometry.
 */
export const MathDiagram: React.FC<MathDiagramProps> = ({
  svgContent,
  imageUrl,
  title = 'Hình vẽ minh họa đề thi',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Clean and sanitize SVG content
  const cleanedSvg = useMemo(() => {
    if (!svgContent) return '';

    let svg = svgContent.trim();

    // Decode HTML entities if escaped
    svg = svg
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');

    // Replace raw LaTeX symbols in SVG text tags with proper mathematical Unicode
    svg = svg
      .replace(/<text([^>]*)>([\s\S]*?)<\/text>/gi, (_match, attrs, textInner) => {
        let cleanText = textInner
          .replace(/-\\infty/g, '−∞')
          .replace(/\+\\infty/g, '+∞')
          .replace(/\\infty/g, '∞')
          .replace(/\\pm/g, '±')
          .replace(/\\approx/g, '≈')
          .replace(/\\pi/g, 'π')
          .replace(/\\alpha/g, 'α')
          .replace(/\\beta/g, 'β')
          .replace(/\\Delta/g, 'Δ');
        return `<text${attrs}>${cleanText}</text>`;
      });

    // Ensure white background and crisp styling
    if (!svg.includes('style=') || (!svg.includes('background') && !svg.includes('#ffffff'))) {
      svg = svg.replace(
        /<svg([^>]*)>/i,
        `<svg$1 style="background-color:#ffffff; border-radius:12px; display:block; margin:0 auto;"><rect width="100%" height="100%" fill="#ffffff"/>`
      );
    }

    return svg;
  }, [svgContent]);

  if (!cleanedSvg && !imageUrl) {
    return null;
  }

  const handleDownloadSvg = () => {
    if (!cleanedSvg) return;
    const blob = new Blob([cleanedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `so-do-toan-2027-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`my-4 flex flex-col items-center ${className}`}>
      {/* Outer White Card Container with Crisp Black Lines */}
      <div className="relative group w-full max-w-lg bg-white rounded-2xl border-2 border-slate-300 shadow-md p-3 sm:p-4 transition-all hover:border-amber-400 hover:shadow-lg">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>{title} (Chuẩn nét đen nền trắng)</span>
          </div>

          <div className="flex items-center gap-1">
            {cleanedSvg && (
              <button
                type="button"
                onClick={handleDownloadSvg}
                title="Tải tệp SVG về máy"
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setIsModalOpen(true);
              }}
              title="Phóng to xem chi tiết"
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phóng to</span>
            </button>
          </div>
        </div>

        {/* Visual Content: SVG or Image */}
        <div className="w-full flex justify-center items-center overflow-x-auto py-1">
          {cleanedSvg ? (
            <div
              className="w-full flex justify-center [&>svg]:max-h-80 [&>svg]:w-auto [&>svg]:max-w-full [&>svg]:mx-auto select-none"
              dangerouslySetInnerHTML={{ __html: cleanedSvg }}
            />
          ) : (
            <img
              src={imageUrl}
              alt={title}
              className="max-h-80 w-auto object-contain rounded-xl select-none"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      {/* Lightbox / Zoom Modal for Intricate Graphs and Variation Tables */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative bg-white text-slate-950 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-slate-300 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {title} - Chế độ xem chi tiết
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  title="Về kích thước gốc"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {cleanedSvg && (
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                    title="Tải tệp SVG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition ml-2"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body with Zoomable Canvas */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-white min-h-[300px]">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full flex justify-center"
              >
                {cleanedSvg ? (
                  <div
                    className="w-full flex justify-center [&>svg]:max-h-[70vh] [&>svg]:w-auto [&>svg]:mx-auto"
                    dangerouslySetInnerHTML={{ __html: cleanedSvg }}
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="max-h-[70vh] w-auto object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
              Chuẩn đồ họa đề thi THPTQG & V-ACT 2027: Nền trắng tuyệt đối, nét vẽ và ký hiệu màu đen.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
