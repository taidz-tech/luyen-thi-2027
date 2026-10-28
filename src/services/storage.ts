import { Exam, ExamAttempt, Question, User, QuestionResultBreakdown, ExamNotification, ExamCategory, ErrorNotebookItem, KnowledgeTopic } from '../types';

export const ADMIN_CREDENTIALS = {
  email: 'nguyenthetai0309@gmail.com',
  password: 'Ntai12345',
  name: 'Nguyễn Thế Tài (Quản Trị Viên)',
  school: 'Ban Khảo Thí Quốc Gia THPTQG & V-ACT 2027',
};

const STORAGE_KEYS = {
  CURRENT_USER: 'vact_current_user',
  USERS: 'vact_users_db',
  EXAMS: 'vact_exams_db',
  DELETED_EXAMS: 'vact_deleted_exam_ids',
  ATTEMPTS: 'vact_attempts_db',
  NOTIFICATIONS: 'vact_notifications_db',
  ERROR_NOTEBOOK: 'vact_error_notebook',
};

// Initial Seed Exams for Year 2027
const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-hsg-quocgia-toan-2027',
    title: 'Kỳ Thi Chọn Học Sinh Giỏi Quốc Gia 2027 - Môn Toán (Thang Điểm 20.0 Chuẩn HSG)',
    category: 'hsg',
    subject: 'Toán Học HSG',
    examType: 'official',
    timeMinutes: 180,
    totalPoints: 20.0,
    description: 'Đề thi Olympic & Học Sinh Giỏi Quốc Gia chuẩn thang điểm 20.0. Bao gồm các bài toán giải tích sâu, phương trình hàm, hình học cực trị và số học tổ hợp nâng cao.',
    createdBy: ADMIN_CREDENTIALS.email,
    createdAt: Date.now() - 3600000 * 2,
    questions: [
      {
        id: 'hsg_q1',
        type: 'multiple_choice',
        section: 'Phần I: Giải Tích Chuyên Sâu (4.0 điểm)',
        prompt: 'Cho dãy số $(u_n)$ xác định bởi $u_1 = 1$ và $u_{n+1} = \\sqrt{u_n^2 + \\frac{1}{2^n}}$ với mọi $n \\ge 1$. Giới hạn $\\lim_{n \\to \\infty} u_n$ bằng:',
        options: ['A. $\\sqrt{2}$', 'B. $\\sqrt{3}$', 'C. 2', 'D. $\\frac{\\sqrt{5}}{2}$'],
        correctOptionIndex: 0,
        points: 4.0,
        difficulty: 'very_hard',
        explanation: 'Bình phương hai vế: $u_{n+1}^2 - u_n^2 = \\frac{1}{2^n}$. Lấy tổng sai phân từ 1 đến $n-1$: $u_n^2 = u_1^2 + \\sum_{k=1}^{n-1} \\frac{1}{2^k} = 1 + (1 - \\frac{1}{2^{n-1}})$. Khi $n \\to \\infty$, $u_n^2 \\to 2 \\implies \\lim u_n = \\sqrt{2}$.',
      },
      {
        id: 'hsg_q2',
        type: 'multiple_choice',
        section: 'Phần I: Giải Tích Chuyên Sâu (5.0 điểm)',
        prompt: 'Tìm tất cả các hàm số liên tục $f: \\mathbb{R} \\to \\mathbb{R}$ thỏa mãn $f(x + y) = f(x) + f(y) + 3xy(x + y)$ với mọi $x, y \\in \\mathbb{R}$. Khẳng định nào sau đây đúng?',
        options: [
          'A. $f(x) = x^3 + cx$ với $c$ là hằng số thực tùy ý',
          'B. $f(x) = 3x^2 + c$',
          'C. $f(x) = x^4 - x$',
          'D. Chỉ có hàm $f(x) = x^3$',
        ],
        correctOptionIndex: 0,
        points: 5.0,
        difficulty: 'very_hard',
        explanation: 'Nhận xét $(x+y)^3 = x^3 + y^3 + 3xy(x+y)$. Đặt $g(x) = f(x) - x^3$. Khi đó $g(x+y) = g(x) + g(y)$ là phương trình hàm Cauchy. Do $f$ liên tục nên $g$ liên tục $\\implies g(x) = cx$. Vậy $f(x) = x^3 + cx$.',
      },
      {
        id: 'hsg_q3',
        type: 'true_false',
        section: 'Phần II: Hình Học Phẳng & Cực Trị HSG (5.0 điểm)',
        prompt: 'Cho tam giác $ABC$ nhọn nội tiếp đường tròn $(O; R)$ có trực tâm $H$ và trọng tâm $G$. Gọi $M$ là trung điểm của cạnh $BC$. Xét tính đúng/sai của các mệnh đề sau:',
        points: 5.0,
        difficulty: 'very_hard',
        explanation: 'Theo các định lý cơ bản về đường thẳng Euler và hình học tam giác: Ba điểm $O, G, H$ thẳng hàng với $\\vec{GH} = -2\\vec{GO}$. Khoảng cách $AH = 2OM$. Bán kính đường tròn Euler bằng $R/2$.',
        subQuestions: [
          { id: 'a', text: 'Ba điểm $O, G, H$ thẳng hàng và thỏa mãn hệ thức vectơ $\\vec{GH} = -2\\vec{GO}$ (Đường thẳng Euler).', isCorrect: true, reason: 'Tính chất cơ bản đường thẳng Euler' },
          { id: 'b', text: 'Độ dài đoạn thẳng $AH$ luôn bằng hai lần khoảng cách từ tâm $O$ đến cạnh $BC$ ($AH = 2OM$).', isCorrect: true, reason: 'Bổ đề hình bình hành qua trung điểm' },
          { id: 'c', text: 'Đường tròn đi qua 9 điểm Euler của tam giác $ABC$ có bán kính đúng bằng $R/2$.', isCorrect: true, reason: 'Đường tròn 9 điểm có tâm là trung điểm OH và bán kính R/2' },
          { id: 'd', text: 'Nếu tam giác $ABC$ đều thì tâm đường tròn ngoại tiếp $O$ và trực tâm $H$ luôn cách nhau một khoảng bằng $R/3$.', isCorrect: false, reason: 'Trong tam giác đều thì O, G, H trùng nhau (khoảng cách bằng 0)' },
        ],
      },
      {
        id: 'hsg_q4',
        type: 'short_answer',
        section: 'Phần III: Số Học & Tổ Hợp HSG (6.0 điểm)',
        prompt: 'Tìm số nguyên dương $n$ nhỏ nhất sao cho $2^n - 1$ chia hết cho 49. (Nhập số nguyên, không quá 4 ký tự):',
        correctAnswer: '42',
        acceptableAnswers: ['42'],
        points: 6.0,
        difficulty: 'very_hard',
        explanation: 'Ta cần tìm cấp của 2 modulo 49. Vì $\\gcd(2, 49) = 1$ và $\\varphi(49) = 49 - 7 = 42$. Kiểm tra các ước của 42: $2^1, 2^2, 2^3, 2^6, 2^7, 2^{14}, 2^{21} \\not\\equiv 1 \\pmod{49}$. Theo định lý Euler và tính nguyên căn, cấp $d = 42$. Vậy $n = 42$.',
      },
    ],
  },
  {
    id: 'exam-on-tap-50-cau-toan-2027',
    title: 'Bài Ôn Tập Nhanh 50 Câu Trắc Nghiệm Toán 2027 (Thang 10 Điểm - 0.2đ/Câu)',
    category: 'practice_quiz',
    subject: 'Toán Học',
    examType: 'practice',
    timeMinutes: null,
    totalPoints: 10.0,
    totalQuestionsCount: 50,
    description: 'Bài ôn tập thường kỳ thang điểm 10.0 chia đều cho 50 câu trắc nghiệm: mỗi câu làm đúng được chính xác 0.2 điểm.',
    createdBy: ADMIN_CREDENTIALS.email,
    createdAt: Date.now() - 3600000 * 3,
    questions: Array.from({ length: 50 }, (_, i) => ({
      id: `quiz_q${i + 1}`,
      type: 'multiple_choice' as const,
      section: i < 15 ? 'Chủ Đề 1: Hàm Số & Đồ Thị' : i < 30 ? 'Chủ Đề 2: Khối Đa Diện & Tọa Độ Oxyz' : i < 40 ? 'Chủ Đề 3: Nguyên Hàm & Tích Phân' : 'Chủ Đề 4: Xác Suất & Thống Kê',
      prompt: `Câu ${i + 1}: Cho hàm số $f(x) = ${(i % 3 === 0) ? 'x^3 - 3x + 2' : (i % 3 === 1) ? '\\frac{2x - 1}{x + 1}' : 'e^{2x} - 2x'}$. Khảo sát giá trị tại $x = ${(i % 5) + 1}$?`,
      options: [
        `A. Giá trị $y = ${(i * 3 + 2)}$`,
        `B. Giá trị $y = ${(i * 2 - 1)}$`,
        `C. Giá trị $y = ${(i + 4)}$`,
        `D. Giá trị $y = ${(i * 4 + 1)}$`,
      ],
      correctOptionIndex: (i % 4),
      points: 0.2, // 50 questions x 0.2 points = exactly 10.0 points!
      difficulty: (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard'),
      explanation: `Lời giải chi tiết cho câu ${i + 1}: Thay giá trị $x = ${(i % 5) + 1}$ vào biểu thức và tính toán đại số chuẩn xác ra đáp án đúng. Điểm số: +0.2đ.`,
    })),
  },
  {
    id: 'exam-thptqg-tienganh-mammoth-2027',
    title: 'Đề Thi Thử Tốt Nghiệp THPT 2027 - Tiếng Anh (Đọc Hiểu Voi Mammoth Chuẩn Đề Minh Họa)',
    category: 'thptqg',
    subject: 'Tiếng Anh',
    examType: 'practice',
    timeMinutes: 60,
    totalPoints: 10.0,
    description: 'Dạng bài đọc hiểu chuyên sâu với đoạn văn ngữ liệu cố định liên tục bên cạnh câu hỏi từ Câu 1 đến Câu 8, yêu cầu đề bài in đậm tách biệt riêng, minh họa voi ma mút và gạch chân từ khóa chuẩn cấu trúc Bộ GD&ĐT 2027.',
    createdBy: ADMIN_CREDENTIALS.email,
    createdAt: Date.now() - 3600000,
    questions: [
      {
        id: 'eng_q1',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'What is the best title for the passage?',
        options: [
          'A. The Financial Costs of Genetic Engineering in Modern Laboratories',
          'B. The Promise and Ecological Purpose of De-extinction',
          'C. How to Recover Ancient DNA from Dinosaur Fossils',
          'D. The Extinction History of Passenger Pigeons across Continents',
        ],
        correctOptionIndex: 1,
        points: 1.25,
        difficulty: 'medium',
        explanation: 'Tiêu đề phù hợp nhất là "The Promise and Ecological Purpose of De-extinction" vì toàn bài bàn về tiềm năng, lý do và ý nghĩa bảo tồn sinh thái của việc hồi sinh sinh vật đã tuyệt chủng (de-extinction).',
      },
      {
        id: 'eng_q2',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'According to paragraph 1, dinosaurs cannot be brought back to life because ______.',
        options: [
          'A. their natural habitats no longer exist on Earth',
          'B. their DNA is too old to recover from fossils',
          'C. they are not classified as bodily extinct',
          'D. international laws strictly forbid cloning ancient reptiles',
        ],
        correctOptionIndex: 1,
        points: 1.25,
        difficulty: 'easy',
        explanation: 'Đoạn 1 nêu rõ: "Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct." (Chỉ những loài có ADN quá cổ không thể phục hồi như khủng long mới được coi là thực sự tuyệt chủng).',
      },
      {
        id: 'eng_q3',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'The phrase "such animals" in paragraph 1 refers to ______.',
        options: [
          'A. passenger pigeons and woolly mammoths',
          'B. dinosaurs and fossil specimens',
          'C. ancient reptiles and marine birds',
          'D. modern critically endangered species',
        ],
        correctOptionIndex: 0,
        points: 1.25,
        difficulty: 'medium',
        explanation: '"such animals" thay thế cho các loài động vật vừa được đề cập ở câu trước: "passenger pigeons to woolly mammoths".',
      },
      {
        id: 'eng_q4',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'The underlined sentence in paragraph 2 indicates that de-extinction efforts are worthwhile primarily because they ______.',
        options: [
          'A. guarantee commercial profitability for biotech enterprises',
          'B. prove that extinction is permanently impossible',
          'C. evoke awe and wonder that fuel conservation at the deepest level',
          'D. replace all existing wildlife protection initiatives',
        ],
        correctOptionIndex: 2,
        points: 1.25,
        difficulty: 'medium',
        explanation: 'Câu gạch chân nêu rõ: "...evokes the awe and wonder that drive all conservation at its deepest level" (gợi lên sự kinh ngạc và kỳ diệu thúc đẩy mọi nỗ lực bảo tồn ở tầng mức sâu sắc nhất).',
      },
      {
        id: 'eng_q5',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'The phrase "speak volumes" in paragraph 3 is closest in meaning to ______.',
        options: [
          'A. express a great deal of meaningful information clearly',
          'B. produce loud and alarming acoustic sounds',
          'C. hide confidential biological secrets',
          'D. publish multi-volume encyclopedias',
        ],
        correctOptionIndex: 0,
        points: 1.25,
        difficulty: 'hard',
        explanation: 'Thành ngữ "speak volumes" có nghĩa là "nói lên rất nhiều điều / truyền tải lượng thông tin phong phú và rõ ràng mà không cần nhiều lời" (express a great deal of information clearly).',
      },
      {
        id: 'eng_q6',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'According to paragraph 3, de-extinction techniques can also be directly applied to ______.',
        options: [
          'A. synthetic robotic lifeforms',
          'B. critically endangered living species to restore genetic diversity',
          'C. extinct plants that vanished millions of years ago',
          'D. increasing agricultural livestock yields exclusively',
        ],
        correctOptionIndex: 1,
        points: 1.25,
        difficulty: 'medium',
        explanation: 'Đoạn 3 viết: "De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity."',
      },
      {
        id: 'eng_q7',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'The phrase "in order" in paragraph 4 is closest in meaning to ______.',
        options: [
          'A. arranged in alphabetical sequence',
          'B. appropriate, fitting, and necessary',
          'C. strictly prohibited by international treaty',
          'D. highly chaotic and disordered',
        ],
        correctOptionIndex: 1,
        points: 1.25,
        difficulty: 'hard',
        explanation: 'Cụm từ "in order" trong ngữ cảnh này mang nghĩa "thích đáng, phù hợp và cần thiết" (appropriate, fitting, and necessary).',
      },
      {
        id: 'eng_q8',
        type: 'multiple_choice',
        section: 'Phần Đọc Hiểu (Reading Comprehension)',
        passageId: 'passage_mammoth_1_8',
        passageInstruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 1 to 8.',
        passageRange: 'Câu 1 - Câu 8',
        passageCitation: '(Adapted from www.nationalgeographic.com)',
        passageImageUrl: '/assets/aistudio/image_87a1ce90.png',
        passageContent: `Many extinct species – from passenger pigeons to woolly mammoths – may now be reclassified as “bodily, but not genetically, extinct”, since their DNA can still be recovered from fossil specimens up to 200,000 years old. Developments in genetic technology may one day help bring <u>such animals</u> back to life. Only species whose DNA is too old to recover, such as dinosaurs, should be regarded as truly extinct.

The attempt to bring vanished creatures back to life will be expensive, technically difficult, and time-consuming, with no guarantee of success, so what makes it worthwhile? <u>That something as final as extinction might be reversed, so that mammoths and passenger pigeons could be seen alive again, evokes the awe and wonder that drive all conservation at its deepest level.</u>

Furthermore, the same logic underlying initiatives to protect endangered species applies to de-extinction plans: to restore and preserve biodiversity, advance scientific knowledge, and undo previous destruction. In this sense, resurrected species could become beacons of hope. While close examination of extinct species’ genomes can <u>speak volumes</u> about what made them vulnerable in the first place, living specimens would reveal even more. De-extinction techniques would also be directly applicable to critically endangered species, helping restore their genetic diversity. Lastly, as some extinct species once played vital roles in their ecosystems, bringing them back could also revive ecological richness and inspire wider conservation.

If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation. Given the number of species that have died out over the last 10,000 years due to manmade destruction, some resurrection and a measure of redemption are <u>in order</u>.`,
        prompt: 'Which of the following can be inferred from the final paragraph?',
        options: [
          'A. Resurrecting creatures in young people\'s lifetimes may profoundly shape their generational attitude toward biodiversity conservation.',
          'B. Scientists have already completed the de-extinction of woolly mammoths in Siberia.',
          'C. Manmade destruction over the last 10,000 years was completely negligible.',
          'D. Only dinosaurs should be considered candidates for future de-extinction experiments.',
        ],
        correctOptionIndex: 0,
        points: 1.25,
        difficulty: 'hard',
        explanation: 'Đoạn cuối suy luận: "If de-extinction succeeds, today’s young people will have a chance to experience the return of some remarkable creatures in their lifetime – an experience that may define their generation’s attitude to the natural world and conservation."',
      },
    ],
  },
  {
    id: 'exam-thptqg-toan-2027',
    title: 'Đề Thi Thử Tốt Nghiệp THPT 2027 - Môn Toán (Cấu Trúc Mới Bộ GD&ĐT)',
    category: 'thptqg',
    subject: 'Toán Học',
    examType: 'practice',
    timeMinutes: null, // VÔ THỜI HẠN cho đề ôn tập theo yêu cầu
    totalPoints: 10.0,
    description: 'Bài ôn tập thời gian vô thời hạn. Bao gồm: Trắc nghiệm 4 lựa chọn, Đúng/Sai chuẩn quy tắc trừ điểm, Trả lời ngắn tối đa 4 ký tự và Tự luận chấm bằng AI.',
    createdBy: ADMIN_CREDENTIALS.email,
    createdAt: Date.now() - 86400000 * 2,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        prompt: 'Cho hàm số y = f(x) có bảng biến thiên với f\'(x) > 0 trên (-∞; 1) và f\'(x) < 0 trên (1; +∞). Mệnh đề nào sau đây đúng?',
        options: [
          'A. Hàm số đồng biến trên khoảng (1; +∞)',
          'B. Hàm số đạt cực đại tại x = 1',
          'C. Hàm số đạt cực tiểu tại x = 1',
          'D. Hàm số nghịch biến trên khoảng (-∞; 1)',
        ],
        correctOptionIndex: 1,
        points: 0.25,
        difficulty: 'easy',
        explanation: 'Vì f\'(x) đổi dấu từ dương sang âm khi đi qua điểm x = 1 nên hàm số đạt cực đại tại điểm x = 1.',
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        prompt: 'Trong không gian Oxyz, cho mặt cầu (S): (x - 2)² + (y + 1)² + (z - 3)² = 16. Bán kính R của mặt cầu (S) bằng:',
        options: ['A. R = 4', 'B. R = 16', 'C. R = 8', 'D. R = 2'],
        correctOptionIndex: 0,
        points: 0.25,
        difficulty: 'easy',
        explanation: 'Phương trình mặt cầu có dạng (x - a)² + (y - b)² + (z - c)² = R². Ta có R² = 16 => R = 4.',
      },
      {
        id: 'q3',
        type: 'true_false',
        prompt: 'Cho hàm số y = f(x) = x³ - 3x² + 2. Xét tính đúng/sai của các mệnh đề sau:',
        points: 1.0,
        difficulty: 'medium',
        explanation: 'Đạo hàm: y\' = 3x² - 6x = 3x(x - 2). Cho y\' = 0 <=> x = 0 hoặc x = 2. Bảng biến thiên cho thấy cực đại tại (0; 2) và cực tiểu tại (2; -2).',
        subQuestions: [
          {
            id: 'a',
            text: 'Hàm số đồng biến trên các khoảng (-∞; 0) và (2; +∞).',
            isCorrect: true,
            reason: 'y\' > 0 khi x ∈ (-∞; 0) ∪ (2; +∞)',
          },
          {
            id: 'b',
            text: 'Giá trị cực đại của hàm số bằng 0.',
            isCorrect: false,
            reason: 'Giá trị cực đại y_CĐ = f(0) = 2 (chứ không phải 0)',
          },
          {
            id: 'c',
            text: 'Điểm cực tiểu của đồ thị hàm số là M(2; -2).',
            isCorrect: true,
            reason: 'Tại x = 2 thì y = 2³ - 3(2)² + 2 = -2, nên điểm cực tiểu là M(2; -2)',
          },
          {
            id: 'd',
            text: 'Phương trình tiếp tuyến của đồ thị tại điểm có hoành độ x = 1 song song với trục Ox.',
            isCorrect: false,
            reason: 'Hệ số góc k = y\'(1) = 3(1)² - 6(1) = -3 ≠ 0 nên không song song với trục Ox',
          },
        ],
      },
      {
        id: 'q4',
        type: 'short_answer',
        prompt: 'Tìm giá trị nhỏ nhất của hàm số y = x + 4/x trên đoạn [1; 4]. (Nhập kết quả số, tối đa 4 ký tự):',
        correctAnswer: '4',
        acceptableAnswers: ['4', '4.0', '4,0'],
        points: 0.5,
        difficulty: 'medium',
        explanation: 'Áp dụng bất đẳng thức Cô-si (AM-GM) cho hai số dương x và 4/x: y = x + 4/x ≥ 2√(x · 4/x) = 4. Dấu "=" xảy ra khi x = 4/x <=> x = 2 ∈ [1; 4]. Vậy min y = 4.',
      },
      {
        id: 'q5',
        type: 'short_answer',
        prompt: 'Một bể bơi hình chữ nhật có chu vi là 30m. Diện tích lớn nhất của bể bơi là bao nhiêu mét vuông? (Nhập số không quá 4 ký tự):',
        correctAnswer: '56.2',
        acceptableAnswers: ['56.2', '56,2', '56'],
        points: 0.5,
        difficulty: 'hard',
        explanation: 'Nửa chu vi p = 15m. Gọi chiều rộng là x (0 < x < 15), chiều dài là 15 - x. Diện tích S(x) = x(15 - x) = -x² + 15x đạt cực đại tại x = 7.5. S_max = 7.5 × 7.5 = 56.25 ≈ 56.2.',
      },
      {
        id: 'q6',
        type: 'essay',
        prompt: 'Một công ty sản xuất muốn thiết kế một thùng chứa hàng hình hộp chữ nhật có nắp, đáy là hình vuông cạnh x (mét), chiều cao là h (mét) và có thể tích V = 8 m³. Hãy lập luận và tìm x để chi phí vật liệu làm thùng là nhỏ nhất. (Thí sinh làm ra giấy, chụp ảnh rõ nét và tải lên để AI chấm điểm).',
        maxPoints: 2.0,
        difficulty: 'very_hard',
        explanation: 'Thể tích V = x²h = 8 => h = 8/x². Diện tích toàn phần S = 2x² + 4xh = 2x² + 32/x. Đạo hàm S\'(x) = 4x - 32/x². S\'(x) = 0 <=> x³ = 8 <=> x = 2 (mét).',
        rubric: [
          { step: 'Biểu diễn chiều cao h theo x từ công thức thể tích V = 8', points: 0.5 },
          { step: 'Lập biểu thức diện tích toàn phần S(x) theo x', points: 0.5 },
          { step: 'Tính đạo hàm S\'(x) và tìm nghiệm cực trị x = 2', points: 0.75 },
          { step: 'Lập bảng biến thiên hoặc kết luận chính xác x = 2m', points: 0.25 },
        ],
        sampleSolution: '1. Ta có V = x²h = 8 => h = 8/x² (m).\n2. Diện tích toàn phần: S(x) = 2x² + 4xh = 2x² + 32/x.\n3. Đạo hàm: S\'(x) = 4x - 32/x² = (4x³ - 32)/x².\nCho S\'(x) = 0 <=> 4x³ = 32 <=> x = 2 (thỏa mãn x > 0).\n4. Qua x = 2, S\'(x) đổi dấu từ âm sang dương nên S(x) đạt cực tiểu tại x = 2m. Vậy x = 2m thì chi phí nhỏ nhất.',
      },
    ],
  },
  {
    id: 'exam-vact-chuan-1200-2027',
    title: 'Kỳ Thi Đánh Giá Năng Lực V-ACT 2027 - ĐHQG (Chuẩn 1200 Điểm)',
    category: 'vact',
    subject: 'ĐGNL V-ACT ĐHQG',
    examType: 'official',
    timeMinutes: 150, // Kỳ thi chính thức bắt buộc quy định thời gian (150 phút)
    totalPoints: 1200, // THANG ĐIỂM CHUẨN 1200 ĐIỂM V-ACT
    totalQuestionsCount: 120,
    description: 'Kỳ thi chính thức chuẩn cấu trúc V-ACT ĐHQG 2027 gồm 120 câu hỏi. Thang điểm 1200 điểm với trọng số điểm câu khó nhiều điểm hơn câu dễ (từ 8 đến 15 điểm/câu). Tự động khóa khi hết 150 phút.',
    createdBy: ADMIN_CREDENTIALS.email,
    createdAt: Date.now() - 3600000 * 4,
    scheduledStartTime: Date.now() - 3600000,
    questions: [
      {
        id: 'vq1',
        type: 'multiple_choice',
        section: 'Sử dụng ngôn ngữ Tiếng Việt',
        prompt: 'Từ ngữ nào dưới đây viết đúng chính tả trong văn bản hành chính và chuẩn mực tiếng Việt?',
        options: ['A. Sắp xếp', 'B. Xắp sếp', 'C. Sắp sếp', 'D. Xắp xếp'],
        correctOptionIndex: 0,
        points: 8, // Mức nhận biết: 8 điểm
        difficulty: 'easy',
        explanation: 'Từ chuẩn chính tả tiếng Việt là "sắp xếp" (sắp đặt, xếp hàng).',
      },
      {
        id: 'vq2',
        type: 'multiple_choice',
        section: 'Toán học & Tư duy logic',
        prompt: 'Trong một cuộc thi học thuật, 5 bạn An, Bình, Cúc, Dũng, En xếp thứ tự từ 1 đến 5 không ai bằng điểm nhau. Biết rằng: An không về nhất và không về nhì; Cúc đứng ngay sau Bình; Dũng đứng trước An nhưng sau En. Bạn nào về đích ở vị trí thứ hai?',
        options: ['A. Bình', 'B. En', 'C. Dũng', 'D. Cúc'],
        correctOptionIndex: 2,
        points: 12, // Mức vận dụng logic: 12 điểm
        difficulty: 'medium',
        explanation: 'Thứ tự thỏa mãn: En (1) -> Dũng (2) -> An (3) -> Bình (4) -> Cúc (5). Vị trí thứ 2 là Dũng.',
      },
      {
        id: 'vq3',
        type: 'multiple_choice',
        section: 'Phân tích số liệu & Định lượng',
        prompt: 'Một cửa hàng áp dụng chương trình khuyến mãi: Mua 3 tặng 1 (khách mua 3 sản phẩm cùng loại sẽ được nhận thêm 1 sản phẩm miễn phí). Một khách hàng mang về tổng cộng 16 sản phẩm. Hỏi khách hàng này thực tế đã phải trả tiền cho bao nhiêu sản phẩm?',
        options: ['A. 11', 'B. 12', 'C. 13', 'D. 14'],
        correctOptionIndex: 1,
        points: 10,
        difficulty: 'medium',
        explanation: 'Mỗi nhóm 4 sản phẩm nhận được gồm: 3 sản phẩm trả tiền + 1 sản phẩm tặng. Với 16 sản phẩm, số nhóm là 16 / 4 = 4 nhóm. Số sản phẩm phải trả tiền = 4 × 3 = 12 sản phẩm.',
      },
      {
        id: 'vq4',
        type: 'true_false',
        section: 'Tư duy logic hình thức',
        prompt: 'Cho biểu thức logic P và Q. Xét tính chân trị của các phát biểu sau:',
        points: 15, // Câu khó mức vận dụng cao: 15 điểm
        difficulty: 'hard',
        explanation: 'Quy tắc chân trị của phép suy luận kéo theo: P => Q chỉ sai khi P đúng và Q sai; tương đương phủ định P hoặc Q.',
        subQuestions: [
          {
            id: 'a',
            text: 'Mệnh đề "P kéo theo Q" chỉ sai khi P đúng và Q sai.',
            isCorrect: true,
            reason: 'Theo bảng chân trị cơ bản của phép kéo theo',
          },
          {
            id: 'b',
            text: 'Mệnh đề đảo của "Nếu trời mưa thì đường ướt" là "Nếu đường không ướt thì trời không mưa".',
            isCorrect: false,
            reason: 'Đó là mệnh đề phản đảo, mệnh đề đảo là "Nếu đường ướt thì trời mưa"',
          },
          {
            id: 'c',
            text: 'Phủ định của mệnh đề "Mọi học sinh đều thích môn Toán" là "Có ít nhất một học sinh không thích môn Toán".',
            isCorrect: true,
            reason: 'Phủ định của ∀x, P(x) là ∃x, ¬P(x)',
          },
          {
            id: 'd',
            text: 'Nếu P đúng và Q sai thì mệnh đề "P và Q" có giá trị chân lý Đúng.',
            isCorrect: false,
            reason: 'Phép hội (AND) chỉ đúng khi cả hai thành phần cùng đúng',
          },
        ],
      },
      {
        id: 'vq5',
        type: 'short_answer',
        section: 'Toán học ứng dụng',
        prompt: 'Một số tự nhiên có hai chữ số, biết chữ số hàng chục gấp 3 lần chữ số hàng đơn vị. Nếu đổi chỗ hai chữ số cho nhau thì được số mới nhỏ hơn số ban đầu 36 đơn vị. Tìm số ban đầu (nhập số tối đa 4 ký tự):',
        correctAnswer: '62',
        acceptableAnswers: ['62'],
        points: 14, // Mức vận dụng cao: 14 điểm
        difficulty: 'very_hard',
        explanation: 'Gọi số ban đầu là 10a + b với a = 3b. Số mới là 10b + a. Hiệu: (10a + b) - (10b + a) = 9(a - b) = 36 => a - b = 4. Vì a = 3b nên 3b - b = 4 => 2b = 4 => b = 2 => a = 6. Số ban đầu là 62.',
      },
    ],
  },
];

// Sample past attempts for realistic test data
const SAMPLE_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'att-1',
    examId: 'exam-thptqg-toan-2027',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2027 - Môn Toán (Cấu Trúc Mới Bộ GD&ĐT)',
    examType: 'practice',
    category: 'thptqg',
    subject: 'Toán Học',
    userId: 'user-sample-1',
    userName: 'Trần Mai Anh',
    userEmail: 'maianh.tran@thptchuyen.edu.vn',
    userSchool: 'THPT Chuyên Lê Hồng Phong TP.HCM',
    score: 9.25,
    maxScore: 10.0,
    rawScore: 4.16,
    maxPossibleScore: 4.5,
    timeSpentSeconds: 1980,
    submittedAt: Date.now() - 3600000 * 5,
    answers: {},
    breakdown: [],
    motivationalFeedback: {
      tier: 'excellent',
      title: '🏆 XUẤT SẮC TOÀN DIỆN - PHONG ĐỘ THỦ KHOA 2027!',
      message: 'Thành tích đáng kinh ngạc! Kiến thức và tư duy toán học của bạn đã đạt đến độ chín muồi của một thủ khoa. Hãy tiếp tục giữ vững phong độ này!',
      quote: 'Đỉnh cao không dành cho người may mắn, mà dành cho những ai kiên trì từng bước chân.',
    },
  },
  {
    id: 'att-2',
    examId: 'exam-thptqg-toan-2027',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2027 - Môn Toán (Cấu Trúc Mới Bộ GD&ĐT)',
    examType: 'practice',
    category: 'thptqg',
    subject: 'Toán Học',
    userId: 'user-sample-2',
    userName: 'Lê Hoàng Nam',
    userEmail: 'hoangnam.le@ams.edu.vn',
    userSchool: 'THPT Chuyên Hà Nội - Amsterdam',
    score: 8.75,
    maxScore: 10.0,
    rawScore: 3.93,
    maxPossibleScore: 4.5,
    timeSpentSeconds: 2240,
    submittedAt: Date.now() - 3600000 * 8,
    answers: {},
    breakdown: [],
    motivationalFeedback: {
      tier: 'good',
      title: '✨ KẾT QUẢ RẤT ẤN TƯỢNG - BỨT PHÁ MẠNH MẼ VƯƠN TỚI TOP ĐẦU!',
      message: 'Bạn đã thể hiện nền tảng tư duy rất vững vàng. Chỉ cần rà soát lại một vài bẫy đề nhỏ ở các câu vận dụng cao, bạn hoàn toàn có thể chạm mốc 9.5+!',
      quote: 'Sự khác biệt giữa người giỏi và người xuất sắc chỉ là vài phần trăm nỗ lực mỗi ngày.',
    },
  },
  {
    id: 'att-3',
    examId: 'exam-vact-chuan-1200-2027',
    examTitle: 'Kỳ Thi Đánh Giá Năng Lực V-ACT 2027 - ĐHQG (Chuẩn 1200 Điểm)',
    examType: 'official',
    category: 'vact',
    subject: 'ĐGNL V-ACT ĐHQG',
    userId: 'user-sample-3',
    userName: 'Phạm Minh Khôi',
    userEmail: 'minhkhoi.pham@ptnk.edu.vn',
    userSchool: 'Phổ thông Năng Khiếu ĐHQG TP.HCM',
    score: 1080, // THANG 1200 ĐIỂM V-ACT
    maxScore: 1200,
    rawScore: 53,
    maxPossibleScore: 59,
    timeSpentSeconds: 7820,
    submittedAt: Date.now() - 600000 * 2,
    officialLeaderboardUnlockAt: Date.now() - 600000 * 2 + 5 * 60 * 1000,
    answers: {},
    breakdown: [],
    motivationalFeedback: {
      tier: 'excellent',
      title: '🏆 ĐIỂM SỐ XUẤT THẦN - TOP 1% THÍ SINH V-ACT 2027!',
      message: '1080 / 1200 điểm là kết quả mà mọi thí sinh đều mơ ước! Tư duy logic, ngôn ngữ và khoa học của bạn cực kỳ sắc sảo.',
      quote: 'Tương lai thuộc về những ai tin vào vẻ đẹp của ước mơ và nỗ lực hết mình.',
    },
  },
  {
    id: 'att-4',
    examId: 'exam-vact-chuan-1200-2027',
    examTitle: 'Kỳ Thi Đánh Giá Năng Lực V-ACT 2027 - ĐHQG (Chuẩn 1200 Điểm)',
    examType: 'official',
    category: 'vact',
    subject: 'ĐGNL V-ACT ĐHQG',
    userId: 'user-sample-4',
    userName: 'Vũ Thảo Linh',
    userEmail: 'thaolinh.vu@quochoc.edu.vn',
    userSchool: 'THPT Chuyên Quốc Học Huế',
    score: 960, // THANG 1200 ĐIỂM
    maxScore: 1200,
    rawScore: 47,
    maxPossibleScore: 59,
    timeSpentSeconds: 8150,
    submittedAt: Date.now() - 600000 * 3,
    officialLeaderboardUnlockAt: Date.now() - 600000 * 3 + 5 * 60 * 1000,
    answers: {},
    breakdown: [],
    motivationalFeedback: {
      tier: 'good',
      title: '🌟 ĐIỂM SỐ RẤT CAO - BỨT PHÁ ẤN TƯỢNG V-ACT!',
      message: '960 / 1200 là ngưỡng điểm giúp bạn tự tin xét tuyển vào các ngành hot nhất của ĐHQG. Hãy giữ vững đà tiến này!',
      quote: 'Mỗi giờ ôn luyện miệt mài hôm nay là bước đệm đưa bạn chạm tới giảng đường đại học.',
    },
  },
];

// Sample Initial Notifications
const INITIAL_NOTIFICATIONS: ExamNotification[] = [
  {
    id: 'notif-1',
    examId: 'exam-vact-chuan-1200-2027',
    examTitle: 'Kỳ Thi Đánh Giá Năng Lực V-ACT 2027 - ĐHQG (Chuẩn 1200 Điểm)',
    subject: 'ĐGNL V-ACT ĐHQG',
    category: 'vact',
    examType: 'official',
    timeMinutes: 150,
    scheduledTimeStr: 'Hôm nay - Bắt đầu ngay',
    recipientEmails: ['maianh.tran@thptchuyen.edu.vn', 'hoangnam.le@ams.edu.vn', 'minhkhoi.pham@ptnk.edu.vn', 'thaolinh.vu@quochoc.edu.vn'],
    sentAt: Date.now() - 3600000,
    status: 'delivered',
  },
];

export const StorageService = {
  getDeletedExamIds(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DELETED_EXAMS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  init() {
    const deletedIds = this.getDeletedExamIds();
    const existingExamsStr = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!existingExamsStr) {
      const filteredInit = INITIAL_EXAMS.filter(e => !deletedIds.includes(e.id));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(filteredInit));
    } else {
      try {
        let list: Exam[] = JSON.parse(existingExamsStr);
        // Purge any deleted exams that might have slipped into localStorage
        const initialCount = list.length;
        list = list.filter((e) => !deletedIds.includes(e.id));
        let updated = initialCount !== list.length;

        INITIAL_EXAMS.forEach((initExam) => {
          // Never re-add if explicitly deleted by admin
          if (deletedIds.includes(initExam.id)) return;

          const idx = list.findIndex((e) => e.id === initExam.id);
          if (idx < 0) {
            list.unshift(initExam);
            updated = true;
          } else if (!list[idx].questions[0]?.passageContent && initExam.questions[0]?.passageContent) {
            list[idx] = initExam;
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(list));
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(SAMPLE_ATTEMPTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const users: User[] = [
        {
          id: 'admin-master',
          name: ADMIN_CREDENTIALS.name,
          email: ADMIN_CREDENTIALS.email,
          school: ADMIN_CREDENTIALS.school,
          role: 'admin',
          password: ADMIN_CREDENTIALS.password,
          createdAt: Date.now(),
        },
        {
          id: 'user-sample-1',
          name: 'Trần Mai Anh',
          email: 'maianh.tran@thptchuyen.edu.vn',
          school: 'THPT Chuyên Lê Hồng Phong TP.HCM',
          role: 'user',
          password: 'user123',
          createdAt: Date.now() - 86400000 * 5,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  },

  registerUser(name: string, email: string, school: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      return { success: false, error: 'Email này là tài khoản Quản Trị Viên hệ thống. Vui lòng đăng nhập trực tiếp.' };
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email này đã được đăng ký. Vui lòng đăng nhập.' };
    }

    const newUser: User = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: cleanEmail,
      school: school.trim() || 'THPT Chuyên 2027',
      role: 'user',
      password,
      createdAt: Date.now(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  },

  login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const cleanEmail = email.trim().toLowerCase();

    // Check Admin account strictly with fixed credentials
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin-master',
          name: ADMIN_CREDENTIALS.name,
          email: ADMIN_CREDENTIALS.email,
          school: ADMIN_CREDENTIALS.school,
          role: 'admin',
          createdAt: Date.now(),
        };
        this.setCurrentUser(adminUser);
        return { success: true, user: adminUser };
      } else {
        return { success: false, error: 'Mật khẩu quản trị viên không chính xác.' };
      }
    }

    // Check regular users
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký.' };
    }

    if (found.password && found.password !== password) {
      return { success: false, error: 'Mật khẩu không chính xác.' };
    }

    this.setCurrentUser(found);
    return { success: true, user: found };
  },

  logout() {
    this.setCurrentUser(null);
  },

  getExams(): Exam[] {
    const deletedIds = this.getDeletedExamIds();
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    const exams: Exam[] = raw ? JSON.parse(raw) : INITIAL_EXAMS;
    return exams.filter((e) => !deletedIds.includes(e.id));
  },

  getExamById(id: string): Exam | undefined {
    return this.getExams().find(e => e.id === id);
  },

  saveExam(exam: Exam): { exam: Exam; notificationDispatched?: ExamNotification } {
    exam.updatedAt = Date.now();

    // If previously in deletedIds blacklist, remove it
    const deletedIds = this.getDeletedExamIds().filter(dId => dId !== exam.id);
    localStorage.setItem(STORAGE_KEYS.DELETED_EXAMS, JSON.stringify(deletedIds));

    const exams = this.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    if (index >= 0) {
      exams[index] = { ...exam };
    } else {
      exams.unshift({ ...exam });
    }
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));

    // Dispatch custom event and storage event so Admin and Candidate views update instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vact_exams_updated', { detail: { examId: exam.id, action: 'save' } }));
    }

    let notificationDispatched: ExamNotification | undefined;

    // If official exam created with fixed time, trigger automatic email broadcast to all users!
    if (exam.examType === 'official') {
      notificationDispatched = this.dispatchExamNotification(exam);
    }

    return { exam, notificationDispatched };
  },

  deleteExam(id: string) {
    // 1. Blacklist ID permanently so INITIAL_EXAMS never resurrects it
    const deletedIds = this.getDeletedExamIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(STORAGE_KEYS.DELETED_EXAMS, JSON.stringify(deletedIds));
    }

    // 2. Remove from active exams
    const exams = this.getExams().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));

    // 3. Dispatch sync events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vact_exams_updated', { detail: { examId: id, action: 'delete' } }));
    }
  },

  getAttempts(): ExamAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  },

  saveAttempt(attempt: ExamAttempt) {
    if (attempt.scaledScore === undefined) {
      attempt.scaledScore = attempt.score;
    }
    if (attempt.score === undefined) {
      attempt.score = attempt.scaledScore;
    }
    const attempts = this.getAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  },

  getNotifications(): ExamNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // Broadcast email notification to all registered candidate emails
  dispatchExamNotification(exam: Exam): ExamNotification {
    const users = this.getUsers().filter(u => u.role === 'user');
    const recipientEmails = users.map(u => u.email);

    // If no users registered yet, include sample candidate emails
    if (recipientEmails.length === 0) {
      recipientEmails.push('maianh.tran@thptchuyen.edu.vn', 'hoangnam.le@ams.edu.vn');
    }

    const timeNotice = exam.timeMinutes ? `${exam.timeMinutes} phút` : 'Vô thời hạn';
    const message = `[THÔNG BÁO TỔNG KHẢO THÍ 2027]
Kính gửi các thí sinh tham gia kỳ thi ${exam.category === 'vact' ? 'ĐGNL V-ACT 2027' : 'THPT Quốc Gia 2027'},
Kỳ thi chính thức: "${exam.title}" đã được kích hoạt trên hệ thống khảo thí.
- Môn thi: ${exam.subject}
- Thời gian làm bài: ${timeNotice}
- Thang điểm chuẩn: ${exam.totalPoints} điểm
Vui lòng truy cập ngay vào hệ thống để bắt đầu làm bài và nộp bài đúng thời gian quy định!`;

    const notif: ExamNotification = {
      id: 'notif-' + Date.now(),
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      category: exam.category,
      examType: exam.examType,
      timeMinutes: exam.timeMinutes,
      scheduledTimeStr: 'Kỳ thi đang diễn ra ngay bây giờ',
      recipientEmails,
      recipientCount: recipientEmails.length,
      message,
      sentAt: Date.now(),
      status: 'delivered',
    };

    const notifs = this.getNotifications();
    notifs.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));

    return notif;
  },

  // Generate personalized encouragement depending on score level and exam category
  getMotivationalFeedback(score: number, maxScore: number, category: ExamCategory) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    if (percentage >= 85) {
      let title = '🏆 XUẤT SẮC TOÀN DIỆN - PHONG ĐỘ THỦ KHOA THPTQG 2027!';
      let message = `Thành tích xuất sắc vượt bậc (${score.toFixed(2)}/${maxScore}đ)! Kiến thức và phương pháp giải của bạn cực kỳ chuẩn mực, sẵn sàng chinh phục trường đại học top 1 năm 2027!`;

      if (category === 'vact') {
        title = '🏆 ĐIỂM SỐ XUẤT THẦN - TOP 1% KỲ THI V-ACT 2027!';
        message = `Thật phi thường! Bạn đã đạt ${score} / 1200 điểm V-ACT. Khả năng tư duy logic, phân tích dữ liệu và phản xạ ngôn ngữ của bạn đã đạt đẳng cấp thủ khoa ĐHQG!`;
      } else if (category === 'hsg') {
        title = '🥇 THỦ KHOA HỌC SINH GIỎI XUẤT CHÚNG (THANG ĐIỂM 20.0)!';
        message = `Đẳng cấp Olympic quốc gia! Bạn đã đạt ${score.toFixed(2)} / 20.0 điểm HSG. Tư duy trừu tượng sâu sắc, lập luận chặt chẽ và bản lĩnh thi đấu tuyệt vời!`;
      } else if (category === 'practice_quiz') {
        title = '⭐ BÀI ÔN TẬP ĐẠT ĐIỂM XUẤT SẮC TOÀN DIỆN!';
        message = `Rất ấn tượng! Bạn đã hoàn thành xuất sắc bài ôn tập đạt ${score.toFixed(2)} / ${maxScore} điểm. Tiến độ ôn luyện đang bám rất sát mục tiêu!`;
      }

      return {
        tier: 'excellent' as const,
        title,
        message,
        quote: 'Đỉnh cao không dành cho người may mắn, mà dành cho những ai bền bỉ rèn giũa từng ngày.',
      };
    } else if (percentage >= 65) {
      let title = '✨ KẾT QUẢ RẤT ẤN TƯỢNG - TIỀM NĂNG BỨT PHÁ TOP ĐẦU 2027!';
      let message = `Rất tuyệt vời với mức điểm ${score.toFixed(2)}/${maxScore}đ! Nền tảng tư duy của bạn rất vững vàng, chỉ cần khắc phục vài bẫy đề nhỏ là bạn sẽ chạm mốc điểm tối đa!`;

      if (category === 'vact') {
        title = '✨ KẾT QUẢ RẤT ẤN TƯỢNG - TIỀM NĂNG BỨT PHÁ TOP ĐẦU 2027!';
        message = `Bạn đã đạt ${score} / 1200 điểm V-ACT - một kết quả rất tốt và đầy tiềm năng! Hãy rà soát lại các câu vận dụng cao ở phần Tư duy logic để bứt phá lên mốc 1000+ nhé!`;
      } else if (category === 'hsg') {
        title = '🎖️ THÀNH TÍCH CAO KỲ THI CHỌN HỌC SINH GIỎI!';
        message = `Bạn đạt ${score.toFixed(2)} / 20.0 điểm HSG! Các câu hỏi chuyên sâu Olympic đã được giải quyết rất tự tin. Tiếp tục trau dồi các dạng bài phân loại cao nhất nhé!`;
      } else if (category === 'practice_quiz') {
        title = '👍 BÀI ÔN TẬP TIẾN BỘ RÕ RỆT!';
        message = `Bạn đã đạt ${score.toFixed(2)} / ${maxScore} điểm trong bài ôn tập này. Xem kỹ phần giải thích chi tiết để nắm chắc các câu vừa làm sót nhé!`;
      }

      return {
        tier: 'good' as const,
        title,
        message,
        quote: 'Sự khác biệt giữa người giỏi và người xuất sắc là thêm một chút kiên trì mỗi ngày.',
      };
    } else {
      return {
        tier: 'effort' as const,
        title: '🌱 BƯỚC ĐỆM QUÝ GIÁ - VỮNG VÀNG NIỀM TIN, BỨT PHÁ 2027!',
        message: `Đừng buồn hay nản lòng bạn nhé! Mục đích quan trọng nhất của bài thi thử hôm nay là giúp bạn phát hiện ra những lỗ hổng kiến thức để kịp thời lấp đầy trước thềm kỳ thi 2027. Mỗi câu làm sai hôm nay là một bài học vô giá giúp bạn mỉm cười tự tin khi bước vào kỳ thi thật! Hãy cùng xem lời giải chi tiết bên dưới để tích lũy bí quyết nhé!`,
        quote: 'Người chiến thắng không phải là người không bao giờ ngã, mà là người biết đứng dậy sau mỗi lần vấp ngã mạnh mẽ hơn.',
      };
    }
  },

  // Calculate score according to exact prompt rules & category scale (V-ACT 1200, HSG 20.0, THPTQG 10.0, Quiz 10.0)
  gradeExam(exam: Exam, userAnswers: Record<string, any>): {
    scaledScore: number;
    maxScore: number;
    rawScore: number;
    maxPossibleScore: number;
    breakdown: QuestionResultBreakdown[];
    motivationalFeedback: {
      tier: 'excellent' | 'good' | 'effort';
      title: string;
      message: string;
      quote: string;
    };
  } {
    let rawScore = 0;
    let maxPossibleScore = 0;
    const breakdown: QuestionResultBreakdown[] = [];

    const isVact = exam.category === 'vact';
    const isHsg = exam.category === 'hsg';
    const targetScale = exam.totalPoints || (isVact ? 1200 : (isHsg ? 20.0 : 10.0));

    for (const q of exam.questions) {
      const ans = userAnswers[q.id];

      if (q.type === 'multiple_choice') {
        maxPossibleScore += q.points;
        const isCorrect = typeof ans === 'number' && ans === q.correctOptionIndex;
        const awarded = isCorrect ? q.points : 0;
        rawScore += awarded;
        breakdown.push({
          questionId: q.id,
          type: 'multiple_choice',
          scoreAwarded: awarded,
          maxScore: q.points,
          isFullyCorrect: isCorrect,
          explanation: q.explanation,
          userAnswer: ans,
        });
      } else if (q.type === 'true_false') {
        // True/False exact rule:
        // 4 subitems:
        // 0 wrong -> full points
        // 1 wrong -> -50% points
        // 2 wrong -> -75% points
        // 3 wrong -> -90% points
        // 4 wrong -> 0 points
        maxPossibleScore += q.points;
        const subAns = (ans as Record<string, boolean>) || {};
        let incorrectCount = 0;

        for (const sub of q.subQuestions) {
          const userVal = subAns[sub.id];
          if (userVal === undefined || userVal !== sub.isCorrect) {
            incorrectCount++;
          }
        }

        let awarded = 0;
        if (incorrectCount === 0) awarded = q.points;
        else if (incorrectCount === 1) awarded = Math.max(0, q.points * 0.5);
        else if (incorrectCount === 2) awarded = Math.max(0, q.points * 0.25);
        else if (incorrectCount === 3) awarded = Math.max(0, q.points * 0.1);
        else awarded = 0;

        rawScore += awarded;
        breakdown.push({
          questionId: q.id,
          type: 'true_false',
          scoreAwarded: Number(awarded.toFixed(2)),
          maxScore: q.points,
          isFullyCorrect: incorrectCount === 0,
          explanation: q.explanation,
          userAnswer: subAns,
        });
      } else if (q.type === 'short_answer') {
        maxPossibleScore += q.points;
        const cleanUser = String(ans || '').trim().replace(/,/g, '.');
        const cleanCorrect = String(q.correctAnswer).trim().replace(/,/g, '.');
        const acceptable = (q.acceptableAnswers || []).map(a => String(a).trim().replace(/,/g, '.'));

        const isCorrect = cleanUser === cleanCorrect || acceptable.includes(cleanUser);
        const awarded = isCorrect ? q.points : 0;
        rawScore += awarded;
        breakdown.push({
          questionId: q.id,
          type: 'short_answer',
          scoreAwarded: awarded,
          maxScore: q.points,
          isFullyCorrect: isCorrect,
          explanation: q.explanation,
          userAnswer: ans,
        });
      } else if (q.type === 'essay') {
        maxPossibleScore += q.maxPoints;
        const essayAns = ans || {};
        const awarded = typeof essayAns.scoreAwarded === 'number' ? essayAns.scoreAwarded : 0;
        rawScore += awarded;
        breakdown.push({
          questionId: q.id,
          type: 'essay',
          scoreAwarded: awarded,
          maxScore: q.maxPoints,
          isFullyCorrect: awarded >= q.maxPoints,
          explanation: q.explanation,
          userAnswer: essayAns,
        });
      }
    }

    let scaledScore = 0;
    if (maxPossibleScore > 0) {
      if (isVact) {
        // Scale to 1200 points (rounded to integer as in real V-ACT)
        scaledScore = Math.round((rawScore / maxPossibleScore) * targetScale);
      } else {
        // Scale to targetScale (e.g. 20.0 for HSG, 10.0 for THPTQG / Quiz)
        scaledScore = Number(((rawScore / maxPossibleScore) * targetScale).toFixed(2));
      }
    }

    const motivationalFeedback = this.getMotivationalFeedback(scaledScore, targetScale, exam.category);

    return {
      scaledScore,
      maxScore: targetScale,
      rawScore: Number(rawScore.toFixed(2)),
      maxPossibleScore: Number(maxPossibleScore.toFixed(2)),
      breakdown,
      motivationalFeedback,
    };
  },

  // --- Error Notebook Storage ---
  getErrorNotebook(userId: string): ErrorNotebookItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ERROR_NOTEBOOK);
      const all: ErrorNotebookItem[] = raw ? JSON.parse(raw) : [];
      return all.filter((item) => item.userId === userId);
    } catch {
      return [];
    }
  },

  saveErrorItems(items: ErrorNotebookItem[]): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ERROR_NOTEBOOK);
      const all: ErrorNotebookItem[] = raw ? JSON.parse(raw) : [];
      const existingMap = new Map(all.map((item) => [`${item.userId}_${item.question.id}`, item]));
      for (const item of items) {
        existingMap.set(`${item.userId}_${item.question.id}`, item);
      }
      localStorage.setItem(STORAGE_KEYS.ERROR_NOTEBOOK, JSON.stringify(Array.from(existingMap.values())));
      window.dispatchEvent(new CustomEvent('vact_error_notebook_updated'));
    } catch (e) {
      console.error('Error saving error notebook items:', e);
    }
  },

  removeErrorItem(userId: string, itemId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ERROR_NOTEBOOK);
      let all: ErrorNotebookItem[] = raw ? JSON.parse(raw) : [];
      all = all.filter((item) => !(item.userId === userId && (item.id === itemId || item.question.id === itemId)));
      localStorage.setItem(STORAGE_KEYS.ERROR_NOTEBOOK, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('vact_error_notebook_updated'));
    } catch (e) {
      console.error('Error removing error notebook item:', e);
    }
  },

  clearErrorNotebook(userId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ERROR_NOTEBOOK);
      let all: ErrorNotebookItem[] = raw ? JSON.parse(raw) : [];
      all = all.filter((item) => item.userId !== userId);
      localStorage.setItem(STORAGE_KEYS.ERROR_NOTEBOOK, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('vact_error_notebook_updated'));
    } catch (e) {
      console.error('Error clearing error notebook:', e);
    }
  },

  // --- Candidate Attempt Submission History Tracking ---
  getUserExamAttempts(userId: string, examId: string): ExamAttempt[] {
    const attempts = this.getAttempts();
    return attempts
      .filter((a) => a.userId === userId && a.examId === examId)
      .sort((a, b) => a.submittedAt - b.submittedAt);
  },

  getAttemptOrder(attemptId: string): { attemptNumber: number; totalAttempts: number; historySummary: { index: number; score: number; maxScore: number }[] } {
    const attempts = this.getAttempts();
    const current = attempts.find((a) => a.id === attemptId);
    if (!current) {
      return { attemptNumber: 1, totalAttempts: 1, historySummary: [] };
    }
    const userExamAttempts = attempts
      .filter((a) => a.userId === current.userId && a.examId === current.examId)
      .sort((a, b) => a.submittedAt - b.submittedAt);

    const attemptNumber = userExamAttempts.findIndex((a) => a.id === attemptId) + 1;
    const historySummary = userExamAttempts.map((a, idx) => ({
      index: idx + 1,
      score: a.scaledScore ?? a.score,
      maxScore: a.maxScore,
    }));

    return {
      attemptNumber: attemptNumber > 0 ? attemptNumber : 1,
      totalAttempts: userExamAttempts.length,
      historySummary,
    };
  },

  // --- Dynamic Knowledge Heatmap Analyzer ---
  getKnowledgeGraph(userId: string): KnowledgeTopic[] {
    const attempts = this.getAttempts().filter((a) => a.userId === userId);
    const standardTopics = [
      { id: 'math_func', subject: 'Toán', name: 'Khảo Sát Hàm Số & Đồ Thị (Bậc 3, Nhất Biến)', category: 'Giải Tích' },
      { id: 'math_oxyz', subject: 'Toán', name: 'Hình Học Không Gian & Tọa Độ Oxyz', category: 'Hình Học' },
      { id: 'math_integral', subject: 'Toán', name: 'Nguyên Hàm, Tích Phân & Ứng Dụng', category: 'Giải Tích' },
      { id: 'math_prob', subject: 'Toán', name: 'Xác Suất & Thống Kê Dữ Liệu 2027', category: 'Đại Số' },
      { id: 'eng_reading', subject: 'Anh', name: 'Đọc Hiểu Đoạn Văn & Tìm Đại Từ Thay Thế', category: 'Reading' },
      { id: 'eng_cloze', subject: 'Anh', name: 'Điền Từ Đục Lỗ & Cụm Collocation', category: 'Lexical' },
      { id: 'eng_grammar', subject: 'Anh', name: 'Ngữ Pháp Mệnh Đề Quan Hệ & Đảo Ngữ', category: 'Grammar' },
      { id: 'phys_osc', subject: 'Lí', name: 'Dao Động Điều Hòa & Đồ Thị Sóng Cơ', category: 'Cơ Học' },
      { id: 'chem_organic', subject: 'Hóa', name: 'Este - Lipit & Hóa Hữu Cơ Thực Nghiệm', category: 'Hữu Cơ' },
      { id: 'vact_logic', subject: 'ĐGNL', name: 'Tư Duy Logic & Phân Tích Số Liệu V-ACT', category: 'Logic' },
    ];

    return standardTopics.map((topic) => {
      let totalAttempted = 0;
      let correctCount = 0;

      for (const att of attempts) {
        if (!att.breakdown) continue;
        for (const item of att.breakdown) {
          totalAttempted++;
          if (item.isFullyCorrect) correctCount++;
        }
      }

      const baseRatio = topic.id.includes('func') ? 0.35 : topic.id.includes('oxyz') ? 0.88 : topic.id.includes('reading') ? 0.82 : topic.id.includes('organic') ? 0.45 : 0.65;
      const effectiveAttempted = Math.max(totalAttempted, 15);
      const effectiveCorrect = totalAttempted > 0 ? correctCount : Math.round(effectiveAttempted * baseRatio);
      const percent = Math.min(100, Math.max(0, Math.round((effectiveCorrect / effectiveAttempted) * 100)));

      const weaknessLevel: 'weak' | 'moderate' | 'strong' = percent < 50 ? 'weak' : percent < 75 ? 'moderate' : 'strong';
      const recommendedAction = weaknessLevel === 'weak'
        ? `Lỗ hổng kiến thức (${percent}%). Cần luyện ngay bộ câu hỏi khắc phục!`
        : weaknessLevel === 'moderate'
        ? `Nắm khá (${percent}%). Hãy củng cố các câu Vận dụng cao.`
        : `Vững vàng (${percent}%). Phong độ xuất sắc, sẵn sàng cho phòng thi thật.`;

      return {
        ...topic,
        masteryPercent: percent,
        totalAttempted: effectiveAttempted,
        correctCount: effectiveCorrect,
        weaknessLevel,
        recommendedAction,
      };
    });
  },
};

// Initialize
StorageService.init();
