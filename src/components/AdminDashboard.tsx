import React, { useState, useRef } from 'react';
import { Exam, ExamAttempt, Question, User, RubricStep, ExamNotification, ExamCategory } from '../types';
import { StorageService } from '../services/storage';
import { MathText } from './MathText';
import { MathDiagram } from './MathDiagram';
import { 
  ShieldCheck, Upload, Sparkles, FileText, CheckCircle2, 
  Trash2, Plus, Brain, AlertTriangle, Eye, Clock, Users, BookOpen, Search, RefreshCw,
  Mail, Send, Bell, Check, Info, Award, FileCode, FileImage, X, Zap, Edit3, Image as ImageIcon, Wand2, Copy,
  BarChart3, TrendingDown, TrendingUp, Target, Activity
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  exams: Exam[];
  attempts: ExamAttempt[];
  onExamsUpdated: () => void;
}

interface UploadedFileInfo {
  name: string;
  size: number;
  mimeType: string;
  base64: string;
  extension: string;
  extractedSnippet?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  exams,
  attempts,
  onExamsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage_exams' | 'all_scores' | 'email_broadcasts' | 'analytics'>('upload');

  // Upload/AI Exam Creation State
  const [rawText, setRawText] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [subject, setSubject] = useState('Toán Học');
  const [category, setCategory] = useState<ExamCategory>('thptqg');
  const [examType, setExamType] = useState<'practice' | 'official'>('practice');
  const [timeMinutes, setTimeMinutes] = useState<number>(90); // default for official

  // Enhanced File State (PDF, DOCX, LaTeX, Images)
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);

  const [aiParsing, setAiParsing] = useState(false);
  const [parsedExamPreview, setParsedExamPreview] = useState<Exam | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [generatingDiagramId, setGeneratingDiagramId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [aiTelemetry, setAiTelemetry] = useState<any | null>(null);

  // Email notification broadcast modal after creating official exam
  const [broadcastNotification, setBroadcastNotification] = useState<ExamNotification | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search/Filter for All Scores
  const [scoreSearch, setScoreSearch] = useState('');
  const [scoreExamFilter, setScoreExamFilter] = useState('all');
  const [inspectAttempt, setInspectAttempt] = useState<ExamAttempt | null>(null);

  const notifications = StorageService.getNotifications();

  // Read file from user device (Support PDF, DOCX, LaTeX, Images, Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const reader = new FileReader();

    if (extension === 'tex' || extension === 'latex' || extension === 'txt' || extension === 'md' || extension === 'json') {
      // Plain text or LaTeX source
      reader.onload = (event) => {
        const textContent = (event.target?.result as string) || '';
        setUploadedFile({
          name: file.name,
          size: file.size,
          mimeType: file.type || 'text/plain',
          base64: '',
          extension,
          extractedSnippet: textContent.slice(0, 300),
        });
        setRawText(textContent);
        if (!examTitle) {
          setExamTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.onerror = () => {
        setAiError('Không thể đọc tệp văn bản. Vui lòng thử lại.');
      };
      reader.readAsText(file, 'utf-8');
    } else {
      // PDF, DOCX, Images: read as DataURL (base64)
      reader.onload = (event) => {
        const dataUrl = (event.target?.result as string) || '';
        const base64Data = dataUrl.split(',')[1] || '';
        setUploadedFile({
          name: file.name,
          size: file.size,
          mimeType: file.type || (extension === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
          base64: base64Data,
          extension,
          extractedSnippet: `[Đã sẵn sàng tải lên ${extension.toUpperCase()} (${(file.size / 1024).toFixed(1)} KB)]`,
        });
        if (!examTitle) {
          setExamTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.onerror = () => {
        setAiError('Không thể đọc tệp tin. Vui lòng kiểm tra quyền truy cập tệp.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Open existing exam for editing/updating
  const handleEditExam = (exam: Exam) => {
    setExamTitle(exam.title);
    setSubject(exam.subject);
    setCategory(exam.category);
    setExamType(exam.examType);
    setTimeMinutes(exam.timeMinutes || 90);
    setParsedExamPreview(exam);
    setAiSuccessMsg(`Đang chỉnh sửa đề thi: "${exam.title}". Bạn có thể cập nhật thông tin và nhấn "Lưu Đề Thi" bên dưới.`);
    setActiveTab('upload');
  };

  // Generate an authentic black-on-white SVG diagram / variation table for a specific question
  const handleGenerateDiagramForQ = async (qId: string, promptText: string) => {
    setGeneratingDiagramId(qId);
    try {
      const res = await fetch('/api/gemini/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await res.json();
      if (data.success && data.svg) {
        setParsedExamPreview((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            questions: prev.questions.map((item) =>
              item.id === qId ? { ...item, illustrationSvg: data.svg } : item
            ),
          };
        });
      }
    } catch (err: any) {
      console.error('Lỗi tạo hình ảnh/đồ thị:', err);
    } finally {
      setGeneratingDiagramId(null);
    }
  };

  // Upload an image or diagram directly for a specific question
  const handleUploadImageForQ = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = (ev.target?.result as string) || '';
      setParsedExamPreview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((item) =>
            item.id === qId ? { ...item, imageUrl: dataUrl } : item
          ),
        };
      });
    };
    reader.readAsDataURL(file);
  };

  // Remove diagram or image from question
  const handleRemoveDiagramForQ = (qId: string) => {
    setParsedExamPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((item) =>
          item.id === qId ? { ...item, illustrationSvg: undefined, imageUrl: undefined } : item
        ),
      };
    });
  };

  // Sample templates to quickly test AI parsing capabilities
  const loadSampleTemplate = (type: 'two_parts' | 'latex' | 'vact' | 'english_reading' | 'vact_stimulus' | 'ministry' | 'hsg' | 'practice_50') => {
    if (type === 'english_reading') {
      setExamTitle('Đề Thi Thử Tốt Nghiệp THPT 2027 - Tiếng Anh (Đọc Hiểu Voi Mammoth)');
      setSubject('Tiếng Anh');
      setCategory('thptqg');
      setExamType('practice');
      setTimeMinutes(60);
      setRawText(`Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.

Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring such animals back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can speak volumes about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are in order.
(Adapted from www.nationalgeographic.com)

Question 1: What is the best title for the passage?
A. The High Financial Costs of Genetic Engineering
B. The Promise and Purpose of De-extinction
C. How to Recover Ancient DNA from Dinosaur Fossils
D. The Extinction History of Passenger Pigeons

Question 2: According to paragraph 1, dinosaurs cannot be brought back to life because:
A. their natural habitats no longer exist
B. their DNA is too old to recover
C. they are not classified as bodily extinct
D. genetic technology is strictly forbidden for reptiles

Question 3: The phrase "such animals" in paragraph 1 refers to:
A. passenger pigeons and woolly mammoths
B. dinosaurs and fossil specimens
C. ancient birds and reptiles
D. critically endangered modern animals

Question 4: The underlined sentence in paragraph 2 indicates that de-extinction efforts are worthwhile primarily because they:
A. are guaranteed to succeed with minimal cost
B. generate enormous revenue for biotechnology firms
C. inspire awe and wonder that power conservation efforts
D. eliminate the need to protect endangered living species

Question 5: The idiom "speak volumes" in paragraph 3 is closest in meaning to:
A. produce loud noises
B. tell a great deal of information
C. conceal hidden secrets
D. create confusing contradictions

Question 6: According to paragraph 3, de-extinction techniques can also benefit:
A. extinct plants only
B. critically endangered living species
C. laboratory robotics
D. agricultural crop production

Question 7: The phrase "in order" in paragraph 4 is closest in meaning to:
A. alphabetical
B. suitable and necessary
C. chronological
D. completely forbidden

Question 8: Which of the following can be inferred from the passage?
A. Bringing back extinct species requires no public funding.
B. De-extinction could help reshape young people's perspectives on environmental conservation.
C. All species that have ever lived can now be cloned.
D. Passenger pigeons will be reintroduced into the wild next year.`);
    } else if (type === 'vact_stimulus') {
      setExamTitle('Kỳ Thi ĐGNL V-ACT 2027 - Khối Dữ Kiện Chung Dây Chuyền Sản Xuất');
      setSubject('ĐGNL V-ACT ĐHQG');
      setCategory('vact');
      setExamType('official');
      setTimeMinutes(150);
      setRawText(`Dựa vào đoạn dữ kiện sau đây để trả lời các câu hỏi từ câu 1 đến câu 4:

Trong một phân xưởng công nghệ cao gồm 4 dây chuyền sản xuất: Alpha, Beta, Gamma và Delta. 
- Dây chuyền Alpha hoạt động liên tục từ 06:00 đến 14:00, tạo ra 120 linh kiện mỗi giờ với tỷ lệ lỗi 2%.
- Dây chuyền Beta hoạt động từ 10:00 đến 18:00, tạo ra 150 linh kiện mỗi giờ với tỷ lệ lỗi 1%.
- Dây chuyền Gamma hoạt động từ 14:00 đến 22:00, tạo ra 100 linh kiện mỗi giờ với tỷ lệ lỗi 3%.
- Dây chuyền Delta hoạt động từ 12:00 đến 20:00, tạo ra 200 linh kiện mỗi giờ với tỷ lệ lỗi 1.5%.
Biết chi phí nguyên vật liệu cho mỗi linh kiện là 50.000 VNĐ, linh kiện lỗi sẽ bị tiêu hủy và không thu hồi được vốn.

Câu 1: Trong khoảng thời gian từ 12:00 đến 14:00, có bao nhiêu dây chuyền cùng hoạt động đồng thời?
A. 1 dây chuyền
B. 2 dây chuyền
C. 3 dây chuyền
D. Cả 4 dây chuyền

Câu 2: Dây chuyền nào tạo ra tổng số linh kiện chuẩn (không bị lỗi) lớn nhất trong một ca làm việc 8 tiếng của mình?
A. Dây chuyền Alpha
B. Dây chuyền Beta
C. Dây chuyền Gamma
D. Dây chuyền Delta

Câu 3: Tổng số linh kiện lỗi bị tiêu hủy của cả 4 dây chuyền trong một ngày làm việc là bao nhiêu?
A. 61 linh kiện
B. 75 linh kiện
C. 82 linh kiện
D. 94 linh kiện

Câu 4: Thiệt hại tài chính do linh kiện lỗi gây ra trên dây chuyền Delta trong một ngày là:
A. 800.000 VNĐ
B. 1.200.000 VNĐ
C. 1.500.000 VNĐ
D. 2.000.000 VNĐ`);
    } else if (type === 'two_parts') {
      setExamTitle('Đề Khảo Sát Toán 2027 (Chỉ Gồm Phần Đúng/Sai & Trả Lời Ngắn)');
      setSubject('Toán Học');
      setCategory('thptqg');
      setExamType('practice');
      setRawText(`ĐỀ KHẢO SÁT CHẤT LƯỢNG MÔN TOÁN 2027
(Cấu trúc thực tế: Đề chỉ gồm 2 phần: Đúng/Sai và Trả lời ngắn, không có trắc nghiệm)

PHẦN I: CÂU HỎI ĐÚNG / SAI
Thí sinh trả lời từ câu 1 đến câu 2. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.

Câu 1: Cho hàm số $y = \\frac{2x^2 - 2x + 2}{-x + 1}$ có đồ thị $(C)$.
a) Hàm số đồng biến trên từng khoảng $(-\\infty; 1)$ và $(1; +\\infty)$.
b) Đồ thị $(C)$ có tiệm cận đứng là đường thẳng $x = 1$.
c) Đường thẳng $y = -2x$ là tiệm cận xiên của đồ thị $(C)$.
d) Giao điểm của hai đường tiệm cận là điểm $I(1; -2)$.

Câu 2: Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = a\\sqrt{3}$.
a) Thể tích khối chóp $S.ABCD$ bằng $\\frac{a^3\\sqrt{3}}{3}$.
b) Tam giác $SBC$ vuông tại $B$.
c) Góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$ bằng $60^\\circ$.
d) Khoảng cách từ điểm $A$ đến mặt phẳng $(SBD)$ bằng $\\frac{a\\sqrt{21}}{7}$.

PHẦN II: CÂU HỎI TRẢ LỜI NGẮN
Thí sinh trả lời từ câu 3 đến câu 4.

Câu 3: Một người gửi tiết kiệm 200 triệu đồng vào ngân hàng với lãi suất 6%/năm theo hình thức lãi kép. Hỏi sau ít nhất bao nhiêu năm người đó nhận được số tiền cả gốc lẫn lãi vượt quá 300 triệu đồng? (Điền số nguyên năm).

Câu 4: Tìm giá trị lớn nhất của hàm số $f(x) = x^3 - 3x + 5$ trên đoạn $[0; 2]$. (Điền số ngắn không quá 4 ký tự).`);
    } else if (type === 'latex') {
      setExamTitle('Đề Thi Thử Toán THPTQG 2027 (Định Dạng Mã Nguồn LaTeX)');
      setSubject('Toán Học');
      setCategory('thptqg');
      setExamType('practice');
      setRawText(`\\documentclass{article}
\\usepackage{amsmath, amssymb}
\\begin{document}

\\section*{ĐỀ KHẢO SÁT CHẤT LƯỢNG TOÁN 2027 - CHUẨN CẤU TRÚC}

\\textbf{Câu 1:} Cho hàm số $f(x) = \\frac{2x - 1}{x + 1}$. Tiệm cận đứng của đồ thị hàm số là:
\\begin{enumerate}
  \\item[A.] $x = 2$
  \\item[B.] $x = -1$
  \\item[C.] $y = 2$
  \\item[D.] $y = -1$
\\end{enumerate}

\\textbf{Câu 2 (Đúng/Sai):} Cho tứ diện đều $ABCD$ có cạnh bằng $a$. Xét tính đúng/sai của các khẳng định sau:
\\begin{itemize}
  \\item[a)] Góc giữa hai đường thẳng $AB$ và $CD$ bằng $90^\\circ$.
  \\item[b)] Thể tích khối tứ diện đều cạnh $a$ bằng $V = \\frac{a^3\\sqrt{2}}{12}$.
  \\item[c)] Bán kính mặt cầu ngoại tiếp tứ diện bằng $R = \\frac{a\\sqrt{6}}{2}$.
  \\item[d)] Khoảng cách giữa hai đường thẳng chéo nhau $AB$ và $CD$ bằng $\\frac{a\\sqrt{2}}{2}$.
\\end{itemize}

\\textbf{Câu 3 (Trả lời ngắn):} Một hộp chứa 6 quả cầu đỏ và 4 quả cầu xanh. Chọn ngẫu nhiên 3 quả cầu. Tính xác suất để chọn được ít nhất 1 quả cầu đỏ. (Kết quả viết dưới dạng số thập phân làm tròn đến 3 chữ số, ví dụ 0.967 hoặc phân số tối giản).

\\textbf{Câu 4 (Tự luận):} Cho hàm số $y = x^3 - 3mx^2 + 3(m^2 - 1)x - m^3 + m$. Tìm tất cả các giá trị của tham số $m$ để đồ thị hàm số có hai điểm cực trị $A$ và $B$ sao cho tam giác $OAB$ vuông tại gốc tọa độ $O$.
\\end{document}`);
    } else if (type === 'vact') {
      setExamTitle('Kỳ Thi Thử Đánh Giá Năng Lực V-ACT 2027 - ĐHQG (Thang 1200 Điểm)');
      setSubject('ĐGNL V-ACT ĐHQG');
      setCategory('vact');
      setExamType('official');
      setTimeMinutes(150);
      setRawText(`KỲ THI ĐÁNH GIÁ NĂNG LỰC V-ACT 2027 - ĐẠI HỌC QUỐC GIA
Tổng điểm: 1200 điểm. Trọng số câu khó nhiều điểm hơn câu dễ.

Phần 1: Sử dụng ngôn ngữ & Tư duy định lượng
Câu 1 (Dễ - 8 điểm): Chọn từ đúng chính tả và ngữ nghĩa để điền vào chỗ trống: "Văn hóa dân tộc là ... trường tồn của lịch sử."
A. mạch nguồn
B. mạch nguần
C. mạc nguồn
D. mặt nguồn

Câu 2 (Trung bình - 11 điểm): Một cửa hàng bán sản phẩm A với lãi suất 25% so với giá vốn. Trong đợt khuyến mãi, cửa hàng giảm giá 10% trên giá bán niêm yết. Hỏi cửa hàng còn lãi bao nhiêu phần trăm so với giá vốn?
A. 12.5%
B. 15%
C. 10%
D. 14.5%

Câu 3 (Khó - 13 điểm): Cho bảng số liệu nhiệt độ và độ ẩm qua 12 tháng. Khi độ ẩm tăng 10% thì xác suất mưa tăng 25%. Biết tháng 7 có độ ẩm 85%, tính xác suất xuất hiện lượng mưa vượt ngưỡng 200mm. (Điền số ngắn không quá 4 ký tự):

Câu 4 (Vận dụng cao - 15 điểm): Một hệ thống mã hóa lượng tử sử dụng dãy nhị phân độ dài n sao cho không có 2 bit 0 đứng cạnh nhau. Viết thuật toán truy hồi và tính số lượng chuỗi hợp lệ khi n = 8.`);
    } else if (type === 'ministry') {
      setExamTitle('Đề Thi Thử Tốt Nghiệp THPT 2027 - Môn Hóa Học');
      setSubject('Hóa Học');
      setCategory('thptqg');
      setExamType('practice');
      setRawText(`ĐỀ KHẢO SÁT CHUYÊN ĐỀ HÓA HỌC 2027
Câu 1: Chất nào sau đây thuộc loại este no, đơn chức, mạch hở?
A. CH3COOCH3
B. CH2=CHCOOCH3
C. HCOOC6H5
D. CH3COOH

Câu 2 (Đúng/Sai): Tiến hành thí nghiệm xà phòng hóa chất béo:
a) Sau bước 1, hỗn hợp trong bát sứ tách thành hai lớp.
b) Mục đích của việc thêm dung dịch NaCl bão hòa là để làm tăng khối lượng riêng của dung dịch giúp xà phòng nổi lên.
c) Sau bước 3, phần chất lỏng phía dưới chứa glycerol.
d) Có thể thay mỡ lợn hoặc dầu dừa bằng dầu bôi trơn máy.

Câu 3 (Trả lời ngắn): Đốt cháy hoàn toàn m gam glucose cần vừa đủ 6.72 lít khí O2 (đktc). Giá trị của m bằng bao nhiêu gam?`);
    } else if (type === 'hsg') {
      setExamTitle('Kỳ Thi Chọn Học Sinh Giỏi Quốc Gia 2027 - Môn Toán (Thang Điểm 20.0 Chuẩn HSG)');
      setSubject('Toán Học HSG');
      setCategory('hsg');
      setExamType('official');
      setTimeMinutes(180);
      setRawText(`KỲ THI CHỌN HỌC SINH GIỎI QUỐC GIA 2027 - MÔN TOÁN
Thang điểm chuẩn: 20.0 điểm. Thời gian: 180 phút.

Câu 1 (4.0 điểm): Cho dãy số (u_n) xác định bởi u_1 = 1 và u_{n+1} = sqrt(u_n^2 + 1/2^n) với mọi n >= 1. Giới hạn lim_{n -> +infinity} u_n bằng:
A. sqrt(2)
B. sqrt(3)
C. 2
D. sqrt(5)/2

Câu 2 (5.0 điểm): Tìm tất cả các hàm số liên tục f: R -> R thỏa mãn f(x + y) = f(x) + f(y) + 3xy(x + y) với mọi x, y thuộc R. Khẳng định nào sau đây đúng?
A. f(x) = x^3 + cx với c là hằng số thực tùy ý
B. f(x) = 3x^2 + c
C. f(x) = x^4 - x
D. Chỉ có hàm f(x) = x^3

Câu 3 (5.5 điểm): Cho tứ diện ABCD có AB vuông góc với CD và AC vuông góc với BD. Chứng minh rằng AD vuông góc với BC và tính thể tích tứ diện theo các cạnh.

Câu 4 (5.5 điểm): Cho đa thức P(x) hệ số nguyên thỏa mãn P(0) = 0 và P(1) = 2. Tìm giá trị nhỏ nhất của P(3).`);
    } else if (type === 'practice_50') {
      setExamTitle('Bài Ôn Tập Thường Kỳ 50 Câu Trắc Nghiệm Môn Toán 2027 (Thang 10 Điểm - 0.2đ/câu)');
      setSubject('Toán Học');
      setCategory('practice_quiz');
      setExamType('practice');
      setTimeMinutes(90);
      setRawText(`BÀI TẬP ÔN LUYỆN THƯỜNG KỲ 2027 - TOÁN HỌC (THANG 10 ĐIỂM CHIA ĐỀU)
Ghi chú: Bài ôn tập gồm các câu trắc nghiệm, mỗi câu đạt 0.2 điểm (50 câu x 0.2đ = 10.0đ).

Câu 1: Cho hàm số y = f(x) có bảng biến thiên. Hàm số đồng biến trên khoảng nào dưới đây?
A. (0; 2)
B. (-infinity; 0)
C. (2; +infinity)
D. (-1; 1)

Câu 2: Cho cấp số cộng (u_n) có u_1 = 3 và công sai d = 4. Số hạng u_2 bằng:
A. 7
B. 12
C. -1
D. 1

Câu 3: Đạo hàm của hàm số y = 3^x là:
A. y' = 3^x * ln3
B. y' = 3^x / ln3
C. y' = x * 3^{x-1}
D. y' = 3^x

Câu 4: Thể tích khối lập phương có cạnh bằng 3a là:
A. 27a^3
B. 9a^3
C. 3a^3
D. 54a^3

Câu 5: Trong không gian Oxyz, toạ độ tâm của mặt cầu (S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16 là:
A. I(1; -2; 3)
B. I(-1; 2; -3)
C. I(1; 2; 3)
D. I(-1; -2; -3)`);
    }
  };

  // Call Gemini AI on the server to review, solve & structure
  const handleAiParse = async () => {
    if (!rawText.trim() && !uploadedFile) {
      setAiError('Vui lòng tải tệp đề thi (PDF, DOCX, LaTeX, Ảnh) hoặc dán nội dung câu hỏi vào khung nhập liệu.');
      return;
    }

    setAiParsing(true);
    setAiError(null);
    setAiSuccessMsg(null);

    const isVact = category === 'vact';
    const isHsg = category === 'hsg';
    const isPracticeQuiz = category === 'practice_quiz';
    const effectiveTime = examType === 'practice' ? null : (Number(timeMinutes) || 90);
    const targetPoints = isVact ? 1200 : (isHsg ? 20.0 : 10.0);

    try {
      const res = await fetch('/api/gemini/parse-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: rawText,
          fileBase64: uploadedFile?.base64,
          fileName: uploadedFile?.name,
          mimeType: uploadedFile?.mimeType,
          examTitle,
          subject,
          category,
          examType,
          timeLimit: effectiveTime,
          targetTotalPoints: targetPoints,
        }),
      });

      const data = await res.json();
      if (data.success && data.exam) {
        const rawParsed = data.exam;
        const completeExam: Exam = {
          id: parsedExamPreview?.id || ('exam-' + Date.now()),
          title: examTitle || rawParsed.title || (isVact ? 'Đề Thi ĐGNL V-ACT 2027' : (isHsg ? 'Kỳ Thi Chọn Học Sinh Giỏi 2027' : (isPracticeQuiz ? 'Bài Ôn Tập Thường Kỳ 2027' : 'Đề Thi THPTQG 2027'))),
          category,
          subject: subject || rawParsed.subject || (isVact ? 'ĐGNL V-ACT ĐHQG' : (isHsg ? 'Toán Học HSG' : 'Toán Học')),
          examType,
          timeMinutes: effectiveTime,
          totalPoints: rawParsed.totalPoints || targetPoints,
          totalQuestionsCount: rawParsed.questions?.length || (isVact ? 120 : 6),
          description: rawParsed.description || (isVact ? 'Kỳ thi ĐGNL V-ACT 2027 chuẩn 1200 điểm.' : (isHsg ? 'Kỳ thi Học Sinh Giỏi thang điểm 20.0 chuẩn Olympic.' : 'Đề thi đã được Gemini AI rà soát 100%.')),
          questions: rawParsed.questions || [],
          createdBy: currentUser.email,
          createdAt: parsedExamPreview?.createdAt || Date.now(),
          updatedAt: Date.now(),
        };

        setParsedExamPreview(completeExam);
        setAiTelemetry(data.aiTelemetry || null);
        setAiSuccessMsg(
          `AI đã trích xuất nguyên bản 100% từ tài liệu! Đã nhận diện thành công đầy đủ ${completeExam.questions.length} câu hỏi (${completeExam.category === 'vact' ? '100% trắc nghiệm 4 lựa chọn, chuẩn thang 1200 điểm V-ACT' : 'chuẩn cấu trúc THPTQG 2027'}), lọc tách đáp án và tính trọng số điểm.`
        );
      } else {
        setAiError(data.error || 'Không thể xử lý đề thi. Vui lòng kiểm tra lại cấu trúc.');
      }
    } catch (err: any) {
      setAiError('Lỗi kết nối tới máy chủ AI: ' + err.message);
    } finally {
      setAiParsing(false);
    }
  };

  // Interactive Question Manipulation Helpers
  const handleUpdateQuestion = (qIndex: number, updatedFields: Partial<Question>) => {
    if (!parsedExamPreview) return;
    setParsedExamPreview((prev) => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], ...updatedFields } as Question;
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (!parsedExamPreview) return;
    if (parsedExamPreview.questions.length <= 1) {
      alert('Đề thi phải có ít nhất 1 câu hỏi.');
      return;
    }
    setParsedExamPreview((prev) => {
      if (!prev) return prev;
      const newQuestions = prev.questions.filter((_, idx) => idx !== qIndex);
      return {
        ...prev,
        questions: newQuestions,
        totalQuestionsCount: newQuestions.length,
      };
    });
  };

  const handleDuplicateQuestion = (qIndex: number) => {
    if (!parsedExamPreview) return;
    setParsedExamPreview((prev) => {
      if (!prev) return prev;
      const sourceQ = prev.questions[qIndex];
      const duplicatedQ: Question = {
        ...JSON.parse(JSON.stringify(sourceQ)),
        id: `q_copy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      const newQuestions = [...prev.questions];
      newQuestions.splice(qIndex + 1, 0, duplicatedQ);
      return {
        ...prev,
        questions: newQuestions,
        totalQuestionsCount: newQuestions.length,
      };
    });
  };

  const handleAddQuestion = () => {
    if (!parsedExamPreview) return;
    const newIdx = parsedExamPreview.questions.length + 1;
    const isVact = category === 'vact';
    const isHsg = category === 'hsg';
    const isQuiz = category === 'practice_quiz';
    const defPoint = isVact ? 10 : (isHsg ? 4.0 : (isQuiz ? 0.2 : 0.25));

    const newQ: Question = {
      id: `q_custom_${Date.now()}`,
      type: 'multiple_choice',
      section: 'Phần I: Câu hỏi trắc nghiệm',
      prompt: `Nội dung câu hỏi ${newIdx}... (Soạn đề bằng KaTeX $...$)`,
      options: ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'],
      correctOptionIndex: 0,
      points: defPoint,
      difficulty: 'medium',
      explanation: 'Lời giải chi tiết cho câu hỏi mới.',
    };

    setParsedExamPreview((prev) => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions, newQ];
      return {
        ...prev,
        questions: newQuestions,
        totalQuestionsCount: newQuestions.length,
      };
    });
    setEditingQuestionId(newQ.id);
  };

  // Evenly distribute 10.0 points across all questions (e.g., 50 questions = 0.2 pts each)
  const handleAutoDistribute10Points = () => {
    if (!parsedExamPreview) return;
    const count = parsedExamPreview.questions.length;
    if (count === 0) return;
    const perQ = Number((10.0 / count).toFixed(3));
    setParsedExamPreview((prev) => {
      if (!prev) return prev;
      const updatedQs = prev.questions.map((q) => ({
        ...q,
        points: q.type === 'essay' ? undefined : perQ,
        maxPoints: q.type === 'essay' ? perQ : undefined,
      })) as Question[];
      return {
        ...prev,
        totalPoints: 10.0,
        category: 'practice_quiz',
        questions: updatedQs,
      };
    });
    setCategory('practice_quiz');
    setAiSuccessMsg(`Đã tự động chia đều 10.0 điểm cho ${count} câu hỏi: Mỗi câu đạt ${perQ} điểm!`);
  };

  // Normalize points to exactly 20.0 (HSG Olympic standard)
  const handleNormalize20PointsHSG = () => {
    if (!parsedExamPreview) return;
    const count = parsedExamPreview.questions.length;
    if (count === 0) return;
    const perQ = Number((20.0 / count).toFixed(2));
    let allocated = 0;
    setParsedExamPreview((prev) => {
      if (!prev) return prev;
      const updatedQs = prev.questions.map((q, idx) => {
        const pt = idx === count - 1 ? Number((20.0 - allocated).toFixed(2)) : perQ;
        allocated += perQ;
        return {
          ...q,
          points: q.type === 'essay' ? undefined : pt,
          maxPoints: q.type === 'essay' ? pt : undefined,
        } as Question;
      });
      return {
        ...prev,
        totalPoints: 20.0,
        category: 'hsg',
        questions: updatedQs,
      };
    });
    setCategory('hsg');
    setAiSuccessMsg(`Đã chuẩn hóa thang điểm 20.0 điểm cho kỳ thi Học Sinh Giỏi (HSG)!`);
  };

  // Save parsed exam to global storage and trigger email broadcast if official
  const handleSaveExam = () => {
    if (!parsedExamPreview) return;
    const isVact = category === 'vact';
    const isHsg = category === 'hsg';
    const targetPoints = isVact ? 1200 : (isHsg ? 20.0 : 10.0);

    const examToSave: Exam = {
      ...parsedExamPreview,
      title: examTitle.trim() || parsedExamPreview.title,
      subject: subject.trim() || parsedExamPreview.subject,
      category,
      examType,
      timeMinutes: examType === 'practice' ? null : (Number(timeMinutes) || 90),
      totalPoints: parsedExamPreview.totalPoints || targetPoints,
      totalQuestionsCount: parsedExamPreview.questions.length,
      updatedAt: Date.now(),
    };

    const { notificationDispatched } = StorageService.saveExam(examToSave);
    onExamsUpdated();

    if (notificationDispatched) {
      setBroadcastNotification(notificationDispatched);
    }

    setParsedExamPreview(null);
    setRawText('');
    setExamTitle('');
    setUploadedFile(null);
    setAiSuccessMsg(
      examToSave.examType === 'official'
        ? `Đã đăng tải kỳ thi chính thức và đồng bộ hóa ngay lập tức tới toàn bộ thí sinh!`
        : 'Đã lưu và xuất bản đề thi thành công! Đã cập nhật tức thì trên giao diện thí sinh.'
    );
    setActiveTab(examToSave.examType === 'official' ? 'email_broadcasts' : 'manage_exams');
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đề thi này khỏi hệ thống? Thí sinh sẽ không còn thấy đề này nữa.')) {
      StorageService.deleteExam(id);
      onExamsUpdated();
      setAiSuccessMsg('Đã xóa vĩnh viễn đề thi thành công! Dữ liệu đã được gỡ bỏ hoàn toàn khỏi hệ thống.');
    }
  };

  const filteredScores = attempts.filter((att) => {
    if (scoreExamFilter !== 'all' && att.examId !== scoreExamFilter) return false;
    if (scoreSearch.trim()) {
      const q = scoreSearch.toLowerCase();
      const matchName = att.userName.toLowerCase().includes(q);
      const matchEmail = att.userEmail.toLowerCase().includes(q);
      const matchSchool = att.userSchool.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSchool) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Bảng Điều Khiển Quản Trị Viên (Admin)
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                Chủ Sở Hữu Duy Nhất
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hệ thống khảo thí THPTQG & V-ACT 2027 • Quyền hạn cấp cao
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Tạo Đề & Thẩm Định AI</span>
          </button>
          <button
            onClick={() => setActiveTab('manage_exams')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'manage_exams'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Quản Lý Đề Thi ({exams.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('email_broadcasts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'email_broadcasts'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Thông Báo Email ({notifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all_scores')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'all_scores'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Toàn Bộ Điểm Số ({attempts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sức Khỏe Đề & Lớp Học</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Upload Exam & Gemini AI Review */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Đăng Tải File Đề Thi & Trợ Lý Khảo Thí Gemini AI (Thinking Mode) 2027
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Hệ thống AI đa phương thức hỗ trợ nhận diện và thẩm định 100% các định dạng:{' '}
                  <span className="text-amber-300 font-semibold">Tài liệu PDF</span>,{' '}
                  <span className="text-sky-300 font-semibold">Tài liệu Word DOCX</span>,{' '}
                  <span className="text-emerald-300 font-semibold">Mã nguồn LaTeX (.tex)</span>,{' '}
                  <span className="text-purple-300 font-semibold">Ảnh scan đề thi</span> và văn bản thuần. AI tự động kiểm duyệt lỗi, giải chi tiết và phân bổ trọng số điểm.
                </p>
              </div>

              {/* Quick sample buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Nạp nhanh mẫu:</span>
                <button
                  type="button"
                  onClick={() => loadSampleTemplate('latex')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition cursor-pointer"
                  title="Nạp mẫu đề định dạng LaTeX"
                >
                  Mẫu LaTeX
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleTemplate('vact')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition cursor-pointer"
                  title="Nạp mẫu ĐGNL V-ACT thang 1200 điểm"
                >
                  Mẫu V-ACT
                </button>
              </div>
            </div>

            {/* Exam Configuration Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tiêu Đề Đề Thi 2027:
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Ví dụ: Kỳ Thi ĐGNL V-ACT 2027 - ĐHQG"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Môn Học / Phân Khối:
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="ĐGNL V-ACT ĐHQG">ĐGNL V-ACT ĐHQG (120 câu - 1200 điểm)</option>
                  <option value="Toán Học">Toán Học (THPTQG 2027)</option>
                  <option value="Vật Lí">Vật Lí (THPTQG 2027)</option>
                  <option value="Hóa Học">Hóa Học (THPTQG 2027)</option>
                  <option value="Sinh Học">Sinh Học (THPTQG 2027)</option>
                  <option value="Ngữ Văn">Ngữ Văn (Tự luận & Đọc hiểu)</option>
                  <option value="Tiếng Anh">Tiếng Anh (THPTQG 2027)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phân Loại Kỳ Thi & Thang Điểm:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('thptqg');
                      setSubject('Toán Học');
                      setTimeMinutes(90);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      category === 'thptqg'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    THPTQG (10đ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('vact');
                      setSubject('ĐGNL V-ACT ĐHQG');
                      setTimeMinutes(150);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      category === 'vact'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    V-ACT (1200đ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('hsg');
                      setSubject('Toán Học HSG');
                      setTimeMinutes(180);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      category === 'hsg'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    Học Sinh Giỏi (20đ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('practice_quiz');
                      setSubject('Toán Học');
                      setTimeMinutes(90);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      category === 'practice_quiz'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    Ôn Tập (10đ chia đều)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hình Thức Đề Thi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamType('practice')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      examType === 'practice'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                    title="Thời gian vô thời hạn, xem giải thích ngay"
                  >
                    Ôn Tập (Vô hạn)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamType('official')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      examType === 'official'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                    title="Có thời gian làm bài, tự động gửi Email thông báo"
                  >
                    Kỳ Thi Có Hạn
                  </button>
                </div>
              </div>
            </div>

            {/* V-ACT Notice */}
            {category === 'vact' && (
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-3 animate-in fade-in">
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sky-300 flex items-center gap-2">
                    <span>Đặc Thù Đề Thi Đánh Giá Năng Lực V-ACT (ĐHQG): Chuẩn 120 Câu Trắc Nghiệm - Thang 1200 Điểm</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    100% các câu hỏi là <strong>Trắc nghiệm 4 phương án (A, B, C, D)</strong> (không có Đúng/Sai hay Trả lời ngắn). Trợ lý AI trích xuất nguyên bản tất cả các câu từ tài liệu, lọc đáp án và tính trọng số điểm phân hóa chính xác 1200 điểm.
                  </p>
                </div>
              </div>
            )}

            {/* HSG Notice */}
            {category === 'hsg' && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-3 animate-in fade-in">
                <Award className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-rose-300 flex items-center gap-2">
                    <span>Kỳ Thi Học Sinh Giỏi (HSG): Thang Điểm Chuẩn 20.0 Điểm Olympic</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Hệ thống chuẩn hóa thang điểm <strong>20.0 điểm</strong> theo đúng quy chế thi Học Sinh Giỏi cấp Tỉnh và Quốc Gia. Các câu hỏi vận dụng cao sâu sắc, phân tích số học, hình học không gian và phương trình hàm chuyên sâu.
                  </p>
                </div>
              </div>
            )}

            {/* Practice Quiz Notice */}
            {category === 'practice_quiz' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-2">
                    <span>Bài Ôn Tập Thường Kỳ: Thang Điểm 10.0 (Tự Động Chia Đều Cho Số Câu Làm Được)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Mức điểm tối đa là <strong>10.0 điểm</strong> và tự động chia đều cho các câu trắc nghiệm (ví dụ: đề gồm <strong>50 câu trắc nghiệm</strong> thì mỗi câu <strong>0.2 điểm</strong>; 40 câu thì mỗi câu <strong>0.25 điểm</strong>). Nếu có phần Đúng/Sai hay Trả lời ngắn sẽ tính chuẩn như thi THPTQG.
                  </p>
                </div>
              </div>
            )}

            {/* Time Configuration if Official Exam */}
            {examType === 'official' ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Thời gian làm bài quy định cho kỳ thi chính thức (phút):
                  </label>
                  <p className="text-[11px] text-slate-400">
                    * Chuẩn V-ACT: 150 phút (120 câu) | Chuẩn THPTQG: 50 - 90 phút.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value))}
                    className="w-28 px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-sm font-bold text-amber-300 text-center focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-semibold text-slate-300">phút</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-emerald-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Chế độ <strong>Đề Ôn Tập</strong>: Thời gian làm bài là <strong>Vô thời hạn</strong> để thí sinh thoải mái nghiên cứu sâu từng câu và xem lời giải chi tiết ngay sau khi làm.
                </span>
              </div>
            )}

            {/* Enhanced File Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-bold text-slate-200">
                  Tải Lên Tệp Đề Thi (PDF, DOCX, LaTeX, Ảnh scan) hoặc Dán Nội Dung:
                </label>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.tex,.latex,.txt,.md,.json,image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chọn Tệp Đề Thi Từ Thiết Bị</span>
                  </button>
                </div>
              </div>

              {/* Supported formats pills */}
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-rose-400" />
                  PDF (Đa trang, công thức, bảng biểu)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-semibold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-blue-400" />
                  Word (.docx / .doc)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
                  <FileCode className="w-3 h-3 text-emerald-400" />
                  LaTeX (.tex / toán học KaTeX)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1">
                  <FileImage className="w-3 h-3 text-purple-400" />
                  Ảnh Scan / Chụp Đề Thi
                </span>
              </div>

              {/* Active Uploaded File Card */}
              {uploadedFile && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      {uploadedFile.extension === 'pdf' ? (
                        <FileText className="w-6 h-6 text-rose-400" />
                      ) : uploadedFile.extension === 'docx' || uploadedFile.extension === 'doc' ? (
                        <FileText className="w-6 h-6 text-blue-400" />
                      ) : uploadedFile.extension === 'tex' ? (
                        <FileCode className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <FileImage className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{uploadedFile.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded uppercase font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {uploadedFile.extension.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dung lượng: {(uploadedFile.size / 1024).toFixed(1)} KB • Sẵn sàng gửi tới Gemini AI Thinking Mode
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearFile}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Xóa tệp này"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Textarea for raw text / LaTeX / notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Khung nhập văn bản / Mã nguồn LaTeX / Ghi chú thêm:</span>
                  {rawText && (
                    <span>{rawText.length} ký tự</span>
                  )}
                </div>

                  {/* Quick sample template buttons */}
                  <div className="flex items-center gap-2 flex-wrap pb-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Mẫu thử nhanh:</span>
                    <button
                      type="button"
                      onClick={() => loadSampleTemplate('english_reading')}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ⚡ Mẫu 1: Tiếng Anh Đọc Hiểu (Bài Đọc Chung Câu 1 - 8 - Voi Mammoth)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleTemplate('vact_stimulus')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ⚡ Mẫu 2: V-ACT Dữ Kiện Chung (Câu 1 - 4)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleTemplate('two_parts')}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ⚡ Mẫu 3: Chỉ Đúng/Sai & Trả lời ngắn (2 phần)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleTemplate('latex')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ⚡ Mẫu 4: Toán LaTeX (4 phần)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleTemplate('hsg')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ⚡ Mẫu 6: Học Sinh Giỏi (HSG 20.0đ Chuẩn Olympic)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleTemplate('practice_50')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      ⚡ Mẫu 7: Ôn Tập 50 Câu (Thang 10đ - 0.2đ/câu)
                    </button>
                  </div>

                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Dán nội dung câu hỏi hoặc mã nguồn LaTeX vào đây (hoặc chọn tệp ở nút bên trên)...
Ví dụ dạng LaTeX:
Câu 1: Cho hàm số $f(x) = x^3 - 3x$. Tìm tiệm cận và giá trị lớn nhất...
A. $M = 2$    B. $M = -2$    C. $M = 0$    D. $M = 4$

Câu 2 (Đúng/Sai): Cho khối chóp $S.ABC$...
a) $SA \\perp (ABC)$
b) Thể tích $V = \\frac{a^3\\sqrt{3}}{6}$

Câu 3 (Trả lời ngắn): Tính diện tích hình phẳng... (Nhập số không quá 4 ký tự)

Câu 4 (Tự luận): Chứng minh rằng phương trình luôn có ít nhất 2 nghiệm phân biệt..."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Error & Success indicators */}
            {aiError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {aiSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{aiSuccessMsg}</span>
              </div>
            )}

            {/* Trigger AI Parse & Solve button */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleAiParse}
                disabled={aiParsing}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {aiParsing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Gemini AI (Thinking Mode) Đang Thẩm Định & Giải Đề 100%...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>AI Rà Soát, Giải Chi Tiết & Phân Trọng Số 2027</span>
                  </>
                )}
              </button>

              {parsedExamPreview && (
                <button
                  onClick={handleSaveExam}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {parsedExamPreview.examType === 'official'
                      ? 'Xuất Bản Kỳ Thi & Tự Động Gửi Email Tới Toàn Bộ Thí Sinh'
                      : 'Xuất Bản Bài Ôn Tập Vô Thời Hạn'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* AI Parsed Exam Live Preview */}
          {parsedExamPreview && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Bản Xem Trước Đề Thi Đã Thẩm Định 2027:
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {parsedExamPreview.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30">
                    {parsedExamPreview.category === 'vact' ? 'Thang 1200 Điểm V-ACT' : (parsedExamPreview.category === 'hsg' ? 'Thang 20.0 Điểm HSG' : (parsedExamPreview.category === 'practice_quiz' ? 'Thang 10.0 Điểm (Chia đều)' : 'Thang 10 Điểm THPTQG'))}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                    {parsedExamPreview.timeMinutes ? `${parsedExamPreview.timeMinutes} phút` : 'Vô thời hạn'}
                  </span>
                </div>
              </div>

              {/* Action Toolbar for Editing, Normalizing, and Adding Questions */}
              <div className="flex items-center justify-between gap-2 flex-wrap p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-300">Công Cụ Đề Thi:</span>
                  <button
                    type="button"
                    onClick={handleAutoDistribute10Points}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Tự động chia đều 10.0 điểm cho tất cả câu trắc nghiệm (ví dụ 50 câu = 0.2đ/câu)"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>⚡ Tự Động Chia Đều 10 Điểm (50 câu x 0.2đ)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNormalize20PointsHSG}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Chuẩn hóa tổng điểm đề thi thành 20.0 điểm theo chuẩn thi Học Sinh Giỏi"
                  >
                    <Award className="w-3.5 h-3.5 text-rose-400" />
                    <span>⚡ Chuẩn Hóa Thang 20.0đ (HSG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>➕ Thêm Câu Hỏi Mới</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveExam}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>💾 Lưu & Xuất Bản Đề</span>
                </button>
              </div>

              {/* Enterprise AI System Telemetry & Guardrail Monitor */}
              {aiTelemetry && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-200">
                        Trạm Giám Sát AI System (Enterprise AI Gateway & Guardrails):
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30">
                      Đánh Giá Chất Lượng: {aiTelemetry.evaluationScore}/100 (ĐẠT CHUẨN)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Mô hình AI:</div>
                      <div className="font-bold text-amber-300 font-mono">{aiTelemetry.model}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Độ trễ & Bộ nhớ đệm:</div>
                      <div className="font-bold text-sky-300 font-mono">
                        {aiTelemetry.latencyMs}ms ({aiTelemetry.cacheHit ? '⚡ Cache Hit' : '✨ Direct'})
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">RAG Bảng Đáp Án:</div>
                      <div className="font-bold text-emerald-300">
                        {aiTelemetry.contextEngineering?.answerKeyTableDetected ? 'Đã lọc sạch 100%' : 'AI tự giải 100%'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Sơ đồ & BBT Chuẩn:</div>
                      <div className="font-bold text-amber-300">
                        {aiTelemetry.metrics?.svgTagsExtracted || 0} hình nét đen nền trắng
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions List with Direct Edit Mode */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {parsedExamPreview.questions.map((q, idx) => {
                  const isEditing = editingQuestionId === q.id;

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all text-xs space-y-3 ${
                        isEditing
                          ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {/* Question Header & Action Toolbar */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">
                            Câu {idx + 1}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300">
                            {q.type}
                          </span>
                          <span className="text-amber-400 font-bold">
                            +{q.type === 'essay' ? (q as any).maxPoints : (q as any).points} điểm
                          </span>
                          {parsedExamPreview.category === 'vact' && q.difficulty && (
                            <span className="text-sky-300 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                              {q.difficulty}
                            </span>
                          )}
                        </div>

                        {/* Question Tools */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                              isEditing
                                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                            }`}
                          >
                            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                            <span>{isEditing ? 'Xong' : 'Sửa Câu Này'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(idx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            title="Nhân bản câu này"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Xóa câu này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reading Comprehension Stimulus Block */}
                      {q.passageContent && (
                        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold text-purple-300">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Bài đọc hiểu / Dữ kiện dùng chung ({q.passageRange || 'Câu liên kết'})</span>
                            </span>
                          </div>
                          {q.passageInstruction && (
                            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 font-bold">
                              Yêu cầu đề (In đậm): {q.passageInstruction}
                            </div>
                          )}
                          {(q.passageImageUrl || q.passageSvg) && (
                            <div className="p-2 rounded-lg bg-white flex justify-center">
                              {q.passageImageUrl && <img src={q.passageImageUrl} alt="Minh họa bài đọc" className="max-h-32 object-contain" />}
                              {q.passageSvg && !q.passageImageUrl && <MathDiagram svgContent={q.passageSvg} title="Minh họa" />}
                            </div>
                          )}
                          <div className="text-slate-300 max-h-32 overflow-y-auto pr-1">
                            <MathText content={q.passageContent} />
                          </div>
                        </div>
                      )}

                      {/* Interactive Edit Form if isEditing */}
                      {isEditing ? (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Tên Phần (Section):
                              </label>
                              <input
                                type="text"
                                value={q.section || ''}
                                onChange={(e) => handleUpdateQuestion(idx, { section: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Điểm Số Câu Này:
                              </label>
                              <input
                                type="number"
                                step="0.05"
                                value={(q.type === 'essay' ? (q as any).maxPoints : (q as any).points) || 0}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (q.type === 'essay') {
                                    handleUpdateQuestion(idx, { maxPoints: val } as any);
                                  } else {
                                    handleUpdateQuestion(idx, { points: val } as any);
                                  }
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300"
                              />
                            </div>
                          </div>

                          {/* Editable Question Prompt */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Nội Dung Câu Hỏi (Hỗ trợ KaTeX $...$):
                            </label>
                            <textarea
                              rows={3}
                              value={q.prompt}
                              onChange={(e) => handleUpdateQuestion(idx, { prompt: e.target.value })}
                              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono"
                            />
                          </div>

                          {/* Editable Multiple Choice Options */}
                          {q.type === 'multiple_choice' && (
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold text-slate-300">
                                4 Phương Án (Tích chọn nút tròn ở phương án đúng):
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const isCorrect = q.correctOptionIndex === oIdx;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`flex items-center gap-2 p-2 rounded-xl border ${
                                        isCorrect
                                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                          : 'bg-slate-950 border-slate-700 text-slate-200'
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuestion(idx, { correctOptionIndex: oIdx })}
                                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border cursor-pointer font-bold text-[10px] ${
                                          isCorrect
                                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                            : 'border-slate-600 text-slate-400'
                                        }`}
                                      >
                                        {['A', 'B', 'C', 'D'][oIdx]}
                                      </button>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const newOpts = [...q.options];
                                          newOpts[oIdx] = e.target.value;
                                          handleUpdateQuestion(idx, { options: newOpts });
                                        }}
                                        className="flex-1 bg-transparent border-none text-xs text-slate-100 focus:outline-none"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Editable True / False statements */}
                          {q.type === 'true_false' && Array.isArray(q.subQuestions) && (
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold text-slate-300">
                                4 Mệnh Đề Đúng / Sai (Bấm nút chuyển đổi ĐÚNG / SAI):
                              </label>
                              <div className="space-y-1.5">
                                {q.subQuestions.map((sub, sIdx) => {
                                  const letter = (sub.id || ['a', 'b', 'c', 'd'][sIdx]).toLowerCase();
                                  return (
                                    <div key={sIdx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-700">
                                      <span className="font-mono font-bold text-amber-400 shrink-0 w-6">
                                        {letter})
                                      </span>
                                      <input
                                        type="text"
                                        value={sub.text}
                                        onChange={(e) => {
                                          const newSubs = [...q.subQuestions];
                                          newSubs[sIdx] = { ...newSubs[sIdx], text: e.target.value };
                                          handleUpdateQuestion(idx, { subQuestions: newSubs });
                                        }}
                                        className="flex-1 bg-transparent border-none text-xs text-slate-100 focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newSubs = [...q.subQuestions];
                                          newSubs[sIdx] = { ...newSubs[sIdx], isCorrect: !newSubs[sIdx].isCorrect };
                                          handleUpdateQuestion(idx, { subQuestions: newSubs });
                                        }}
                                        className={`px-3 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                                          sub.isCorrect
                                            ? 'bg-emerald-500 text-slate-950'
                                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        }`}
                                      >
                                        {sub.isCorrect ? 'ĐÚNG' : 'SAI'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Editable Short Answer */}
                          {q.type === 'short_answer' && (
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Đáp Án Ngắn Chuẩn (Ví dụ: 0.967 hoặc 5):
                              </label>
                              <input
                                type="text"
                                value={q.correctAnswer || ''}
                                onChange={(e) => handleUpdateQuestion(idx, { correctAnswer: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs font-bold text-emerald-300"
                              />
                            </div>
                          )}

                          {/* Editable Explanation */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Lời Giải Chi Tiết / Hướng Dẫn Chấm:
                            </label>
                            <textarea
                              rows={2}
                              value={q.explanation || ''}
                              onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                            />
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="space-y-2">
                          <div className="text-slate-200">
                            <MathText content={q.prompt} />
                          </div>

                          {/* Math Diagram (SVG or Image) */}
                          {(q.illustrationSvg || q.imageUrl) && (
                            <MathDiagram
                              svgContent={q.illustrationSvg}
                              imageUrl={q.imageUrl}
                              title={`Hình vẽ / Bảng biến thiên Câu ${idx + 1}`}
                            />
                          )}

                          {/* Diagram Controls */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleGenerateDiagramForQ(q.id, q.prompt)}
                              disabled={generatingDiagramId === q.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                              title="Yêu cầu AI vẽ lại bảng biến thiên / sơ đồ / đồ thị cho câu này"
                            >
                              {generatingDiagramId === q.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                                  <span>AI đang vẽ sơ đồ...</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-3 h-3 text-amber-400" />
                                  <span>AI Vẽ Lại Bảng Biến Thiên / Đồ Thị</span>
                                </>
                              )}
                            </button>

                            <label className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer">
                              <ImageIcon className="w-3 h-3 text-sky-400" />
                              <span>Tải Ảnh Cho Câu Này</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUploadImageForQ(q.id, e)}
                                className="hidden"
                              />
                            </label>

                            {(q.illustrationSvg || q.imageUrl) && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDiagramForQ(q.id)}
                                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-rose-300 border border-rose-900/40 text-[11px] transition cursor-pointer"
                                title="Xóa hình của câu này"
                              >
                                Xóa hình
                              </button>
                            )}
                          </div>

                          {/* Multiple Choice Options View */}
                          {q.type === 'multiple_choice' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-lg text-[11px] border ${
                                    oIdx === q.correctOptionIndex
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <MathText content={opt} />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* True / False Subquestions View */}
                          {q.type === 'true_false' && Array.isArray(q.subQuestions) && (
                            <div className="space-y-1 mt-2">
                              {q.subQuestions.map((sub, sIdx) => {
                                const letter = (sub.id?.replace(/^q\d+_?/i, '') || ['a', 'b', 'c', 'd'][sIdx]).toLowerCase();
                                const subText = sub.text || (sub as any).statement || (sub as any).content || '';
                                return (
                                  <div key={sIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between gap-2">
                                    <div className="flex items-start gap-1.5 flex-1">
                                      <span className="font-mono font-bold text-amber-400">{letter})</span>
                                      <span className="text-slate-200"><MathText content={subText || `Ý ${letter})`} /></span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${sub.isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                                      {sub.isCorrect ? 'ĐÚNG' : 'SAI'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Short Answer View */}
                          {q.type === 'short_answer' && (
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-bold">
                              Đáp án chuẩn: {q.correctAnswer}
                            </div>
                          )}

                          {/* Essay View */}
                          {q.type === 'essay' && (
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                              <div className="text-amber-400 font-bold">Barem chấm điểm (Tối đa: {q.maxPoints}đ):</div>
                              {q.rubric.map((r, rIdx) => (
                                <div key={rIdx} className="text-slate-400">• {r.step}: +{r.points}đ</div>
                              ))}
                            </div>
                          )}

                          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <strong>Lời giải chi tiết:</strong> <MathText content={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Manage All Exams */}
      {activeTab === 'manage_exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Danh sách đề thi đang phục vụ thí sinh trên hệ thống</span>
            <button
              onClick={() => setActiveTab('upload')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Đề Thi Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {exam.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        exam.examType === 'official'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {exam.examType === 'official' ? 'Kỳ Thi Có Hạn' : 'Ôn Tập Vô Hạn'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{exam.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {exam.timeMinutes ? `${exam.timeMinutes} phút` : 'Vô thời hạn'}
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">
                      {exam.category === 'vact' ? '1200 điểm V-ACT' : (exam.category === 'hsg' ? '20.0 điểm HSG' : (exam.category === 'practice_quiz' ? `${exam.totalPoints || 10.0} điểm (Chia đều)` : `${exam.totalPoints || 10.0} điểm`))}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditExam(exam)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center gap-1"
                      title="Chỉnh sửa / Cập nhật đề thi này"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-[11px] font-semibold hidden sm:inline">Sửa Đề</span>
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Xóa đề thi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Email Broadcast Log */}
      {activeTab === 'email_broadcasts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              Lịch Sử Thông Báo Email Tự Động Tới Toàn Bộ Thí Sinh
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Khi Admin tạo bất kỳ kỳ thi chính thức nào, hệ thống tự động phát tán email thông báo kèm lịch thi đến danh sách tất cả thí sinh đã đăng ký.
            </p>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {notif.subject}
                      </span>
                      <h5 className="text-sm font-bold text-white mt-0.5">
                        {notif.examTitle}
                      </h5>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(notif.sentAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line">
                  {notif.message}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>
                    Đã gửi tới: <strong>{notif.recipientCount} thí sinh</strong>
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã phân phối thành công</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: All Scores & Attempts Inspection (Admin Privileged) */}
      {activeTab === 'all_scores' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={scoreSearch}
                onChange={(e) => setScoreSearch(e.target.value)}
                placeholder="Tìm thí sinh, email, trường..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Lọc theo đề:</span>
              <select
                value={scoreExamFilter}
                onChange={(e) => setScoreExamFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="all">Tất cả bài thi</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scores Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-semibold">Thí Sinh</th>
                    <th className="p-3.5 font-semibold">Trường THPT</th>
                    <th className="p-3.5 font-semibold">Đề Thi</th>
                    <th className="p-3.5 font-semibold text-center">Lần Nộp & Tiến Trình</th>
                    <th className="p-3.5 font-semibold text-center">Điểm Số</th>
                    <th className="p-3.5 font-semibold text-center">Thời Gian Làm</th>
                    <th className="p-3.5 font-semibold text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredScores.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Chưa có lượt nộp bài nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredScores.map((att) => {
                      const order = StorageService.getAttemptOrder(att.id);
                      return (
                        <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-medium text-slate-200">
                            <div>{att.userName}</div>
                            <div className="text-[10px] text-slate-400">{att.userEmail}</div>
                          </td>
                          <td className="p-3.5 text-slate-300">{att.userSchool}</td>
                          <td className="p-3.5 text-slate-300 max-w-xs truncate">
                            {att.examTitle}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300 border border-amber-500/30">
                              Nộp lần thứ {order.attemptNumber}
                            </span>
                            {order.totalAttempts > 1 && (
                              <div
                                className="text-[10px] text-slate-400 font-mono mt-1"
                                title="Lịch sử các lần nộp bài: Lần 1, Lần 2, Lần 3..."
                              >
                                {order.historySummary.map((h) => `L${h.index}: ${h.score}đ`).join(' ➔ ')}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`font-mono font-bold px-2.5 py-1 rounded-lg ${
                                (att.scaledScore ?? att.score) >= (att.maxScore * 0.8)
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-200'
                              }`}
                            >
                              {att.scaledScore ?? att.score} / {att.maxScore}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-400">
                            {Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setInspectAttempt(att)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer transition"
                            >
                              Xem Bài
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Sức Khỏe Đề Thi & Báo Cáo Sư Phạm Lớp Học (Analytics Dashboard) */}
      {activeTab === 'analytics' && (() => {
        // Calculate Exam Statistics
        const examStats = exams.map((ex) => {
          const exAttempts = attempts.filter((a) => a.examId === ex.id);
          const totalAtt = exAttempts.length;
          const avgScore = totalAtt > 0
            ? exAttempts.reduce((acc, curr) => acc + (curr.scaledScore ?? curr.score), 0) / totalAtt
            : 0;
          const maxPoints = ex.totalPoints || 10;
          const avgPercent = totalAtt > 0 ? (avgScore / maxPoints) * 100 : 0;
          return {
            exam: ex,
            totalAtt,
            avgScore,
            maxPoints,
            avgPercent,
          };
        });

        const examsWithAttempts = examStats.filter((es) => es.totalAtt > 0);
        const lowestAvgExam = [...examsWithAttempts].sort((a, b) => a.avgPercent - b.avgPercent)[0];
        const highestAvgExam = [...examsWithAttempts].sort((a, b) => b.avgPercent - a.avgPercent)[0];

        // Overall average % across all attempts
        const overallAvgPercent = attempts.length > 0
          ? Math.round(
              attempts.reduce((acc, a) => acc + ((a.scaledScore ?? a.score) / (a.maxScore || 10)) * 100, 0) /
                attempts.length
            )
          : 0;

        // Failure Rate by Question across all attempts
        const questionStatsMap: Record<string, {
          questionId: string;
          totalAnswered: number;
          wrongCount: number;
          question?: Question;
          examTitle: string;
        }> = {};

        attempts.forEach((att) => {
          const currentExam = exams.find((e) => e.id === att.examId);
          att.breakdown.forEach((b) => {
            if (!questionStatsMap[b.questionId]) {
              const qObj = currentExam?.questions.find((q) => q.id === b.questionId);
              questionStatsMap[b.questionId] = {
                questionId: b.questionId,
                totalAnswered: 0,
                wrongCount: 0,
                question: qObj,
                examTitle: att.examTitle,
              };
            }
            questionStatsMap[b.questionId].totalAnswered += 1;
            if (!b.isFullyCorrect || b.scoreAwarded < b.maxScore) {
              questionStatsMap[b.questionId].wrongCount += 1;
            }
          });
        });

        const highFailureQuestions = Object.values(questionStatsMap)
          .filter((qs) => qs.totalAnswered >= 1)
          .map((qs) => ({
            ...qs,
            failureRate: Math.round((qs.wrongCount / qs.totalAnswered) * 100),
          }))
          .sort((a, b) => b.failureRate - a.failureRate)
          .slice(0, 6);

        // Score Distribution brackets
        const scoreDistribution = {
          under5: 0,
          range5to7: 0,
          range7to85: 0,
          above85: 0,
        };
        attempts.forEach((a) => {
          const pct = a.maxScore > 0 ? ((a.scaledScore ?? a.score) / a.maxScore) * 100 : 0;
          if (pct < 50) scoreDistribution.under5 += 1;
          else if (pct < 70) scoreDistribution.range5to7 += 1;
          else if (pct < 85) scoreDistribution.range7to85 += 1;
          else scoreDistribution.above85 += 1;
        });

        const totalAttemptsCount = attempts.length || 1;

        return (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Tổng Số Lượt Nộp Bài</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-white">{attempts.length}</div>
                <p className="text-[11px] text-slate-400">Từ tất cả các kỳ thi & bài ôn tập</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Điểm Trung Bình Toàn Hệ Thống</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{overallAvgPercent}%</div>
                <p className="text-[11px] text-slate-400">Quy đổi thang điểm 100% chuẩn hóa</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Đề Cần Chú Ý Nhất (Điểm Thấp)</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-sm font-bold text-rose-300 truncate">
                  {lowestAvgExam ? lowestAvgExam.exam.title : 'Chưa có dữ liệu'}
                </div>
                <p className="text-[11px] text-slate-400">
                  {lowestAvgExam ? `Điểm TB: ${(lowestAvgExam.avgScore).toFixed(1)} / ${lowestAvgExam.maxPoints} (${Math.round(lowestAvgExam.avgPercent)}%)` : 'Cần thêm lượt thi'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Tỷ Lệ Đạt Yêu Cầu (≥50%)</span>
                  <Target className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {Math.round(((attempts.length - scoreDistribution.under5) / totalAttemptsCount) * 100)}%
                </div>
                <p className="text-[11px] text-slate-400">{attempts.length - scoreDistribution.under5} thí sinh đạt trên trung bình</p>
              </div>
            </div>

            {/* Row: Lowest Average Score Exam & Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lowest Average Exam Spotlight Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-rose-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span>Cảnh Báo: Đề Thi Có Điểm Trung Bình Thấp Nhất</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                    Khó / Cần Ôn Tập
                  </span>
                </div>

                {lowestAvgExam ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <h4 className="text-base font-bold text-white">{lowestAvgExam.exam.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span>Môn: <strong className="text-slate-200">{lowestAvgExam.exam.subject}</strong></span>
                        <span>•</span>
                        <span>Số lượt đã thi: <strong className="text-amber-400">{lowestAvgExam.totalAtt}</strong></span>
                        <span>•</span>
                        <span>Điểm TB: <strong className="text-rose-400">{lowestAvgExam.avgScore.toFixed(2)} / {lowestAvgExam.maxPoints}</strong></span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 space-y-2">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Đánh Giá Khảo Thí & Đề Xuất Sư Phạm Từ Gemini AI:</span>
                      </div>
                      <p className="leading-relaxed">
                        Đề thi này có tỷ lệ điểm dưới trung bình cao hơn mặt bằng chung. Thí sinh thường gặp khó khăn ở các câu hỏi bẫy tư duy và các câu hỏi vận dụng cao (VDC). Giáo viên nên tổ chức buổi chữa đề chuyên sâu hoặc tạo các bài luyện tập nhắm thẳng vào các câu hỏi bên dưới.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Chưa có bài thi nào được hoàn thành để đo lường.
                  </div>
                )}
              </div>

              {/* Score Distribution Overview */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <span>Phổ Điểm Toàn Hệ Thống (Score Distribution)</span>
                  </div>
                  <span className="text-xs text-slate-400">Tổng: {attempts.length} bài thi</span>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Bracket 1: >= 8.5 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">Xuất Sắc (≥ 8.5đ / ≥ 1020đ V-ACT)</span>
                      <span className="font-mono text-slate-300">
                        {scoreDistribution.above85} thí sinh ({Math.round((scoreDistribution.above85 / totalAttemptsCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${(scoreDistribution.above85 / totalAttemptsCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Bracket 2: 7.0 - 8.5 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-sky-400">Giỏi (7.0 - 8.4đ / 840 - 1019đ V-ACT)</span>
                      <span className="font-mono text-slate-300">
                        {scoreDistribution.range7to85} thí sinh ({Math.round((scoreDistribution.range7to85 / totalAttemptsCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full"
                        style={{ width: `${(scoreDistribution.range7to85 / totalAttemptsCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Bracket 3: 5.0 - 7.0 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-400">Khá (5.0 - 6.9đ / 600 - 839đ V-ACT)</span>
                      <span className="font-mono text-slate-300">
                        {scoreDistribution.range5to7} thí sinh ({Math.round((scoreDistribution.range5to7 / totalAttemptsCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${(scoreDistribution.range5to7 / totalAttemptsCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Bracket 4: < 5.0 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-400">Dưới Trung Bình (&lt; 5.0đ / &lt; 600đ V-ACT)</span>
                      <span className="font-mono text-slate-300">
                        {scoreDistribution.under5} thí sinh ({Math.round((scoreDistribution.under5 / totalAttemptsCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full"
                        style={{ width: `${(scoreDistribution.under5 / totalAttemptsCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions with Highest Failure Rate (Cảnh Báo Câu Hỏi Có Tỷ Lệ Làm Sai Cao Nhất) */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Top Câu Hỏi Có Tỷ Lệ Làm Sai Cao Nhất (Cảnh Báo Lỗ Hổng Kiến Thức Hoặc Lỗi Bẫy)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Thống kê từ các bài thi đã nộp: giúp giáo viên nhận diện bẫy đề thi và các phần học sinh thường nhầm lẫn
                    </p>
                  </div>
                </div>
              </div>

              {highFailureQuestions.length > 0 ? (
                <div className="space-y-3">
                  {highFailureQuestions.map((item, idx) => (
                    <div
                      key={item.questionId}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-rose-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-[11px] border border-rose-500/40">
                            #{idx + 1} • Tỷ Lệ Sai: {item.failureRate}%
                          </span>
                          <span className="text-xs font-semibold text-amber-400">
                            {item.examTitle}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({item.wrongCount}/{item.totalAnswered} lượt làm sai)
                          </span>
                        </div>
                      </div>

                      {item.question ? (
                        <div className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
                          <MathText content={item.question.prompt} />
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">Mã câu hỏi: {item.questionId}</div>
                      )}

                      {item.question?.explanation && (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          <strong className="text-amber-400">Chỉ điểm bẫy đề: </strong>
                          <MathText content={item.question.explanation.slice(0, 200) + '...'} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Chưa có đủ dữ liệu câu hỏi làm sai để phân tích.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Inspect Attempt Modal */}
      {inspectAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Chi Tiết Bài Làm Của Thí Sinh:
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  {inspectAttempt.userName} ({inspectAttempt.userSchool})
                </h4>
              </div>
              <button
                onClick={() => setInspectAttempt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950 text-center text-xs">
              <div>
                <span className="text-slate-400 block">Điểm Đạt Được:</span>
                <span className="text-lg font-mono font-bold text-amber-400">
                  {inspectAttempt.scaledScore ?? inspectAttempt.score} / {inspectAttempt.maxScore}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Thời Gian Làm:</span>
                <span className="text-lg font-mono font-bold text-slate-200">
                  {Math.floor(inspectAttempt.timeSpentSeconds / 60)}p {inspectAttempt.timeSpentSeconds % 60}s
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Thời Điểm Nộp:</span>
                <span className="text-xs text-slate-300 mt-1 block">
                  {new Date(inspectAttempt.submittedAt).toLocaleTimeString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-300 uppercase">
                Chi Tiết Từng Câu Hỏi:
              </h5>
              {inspectAttempt.breakdown.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-200">Câu {idx + 1} ({b.type})</span>
                    <span className={b.isFullyCorrect ? 'text-emerald-400' : 'text-amber-400'}>
                      +{b.scoreAwarded} / {b.maxScore} điểm
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <strong>Lời giải:</strong> <MathText content={b.explanation} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setInspectAttempt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Notification Success Modal */}
      {broadcastNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Mail className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">
              Đã Gửi Email Thông Báo Tới Toàn Bộ Thí Sinh!
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hệ thống đã tự động gửi email thông báo kỳ thi <strong>{broadcastNotification.examTitle}</strong> đến{' '}
              <strong className="text-amber-400">{broadcastNotification.recipientCount} tài khoản thí sinh</strong> trên toàn quốc để các bạn kịp thời tham gia dự thi đúng giờ!
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs font-mono text-slate-300">
              {broadcastNotification.message}
            </div>
            <button
              onClick={() => setBroadcastNotification(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Tôi Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
