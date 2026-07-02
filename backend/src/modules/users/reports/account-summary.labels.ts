export type AccountSummaryLang = 'en' | 'ru' | 'uz';

export interface AccountSummaryLabels {
  title: string;
  generatedOn: string;
  personalInfo: string;
  fullName: string;
  login: string;
  role: string;
  department: string;
  bachelorDegree: string;
  masterDegree: string;
  phdDegree: string;
  academicTitle: string;
  university: string;
  year: string;
  speciality: string;
  notSpecified: string;
  roleNames: Record<'admin' | 'departmenthead' | 'teacher', string>;
}

/**
 * Small, self-contained label set for the account-summary PDF only.
 * Not wired to frontend/public/locales — the backend has no i18n
 * infrastructure, and duplicating ~10 static strings here is simpler
 * than adding one just for this report.
 */
export const ACCOUNT_SUMMARY_LABELS: Record<
  AccountSummaryLang,
  AccountSummaryLabels
> = {
  en: {
    title: 'Employee Card',
    generatedOn: 'Generated on',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    login: 'Login',
    role: 'Role',
    department: 'Department',
    bachelorDegree: 'Bachelor Degree',
    masterDegree: 'Master Degree',
    phdDegree: 'PhD Degree',
    academicTitle: 'Academic Title',
    university: 'University',
    year: 'Year',
    speciality: 'Speciality',
    notSpecified: 'Not specified',
    roleNames: {
      admin: 'Administrator',
      departmenthead: 'Department Head',
      teacher: 'Teacher',
    },
  },
  ru: {
    title: 'Карточка сотрудника',
    generatedOn: 'Дата формирования',
    personalInfo: 'Личная информация',
    fullName: 'ФИО',
    login: 'Логин',
    role: 'Роль',
    department: 'Кафедра',
    bachelorDegree: 'Бакалавриат',
    masterDegree: 'Магистратура',
    phdDegree: 'Учёная степень PhD',
    academicTitle: 'Учёное звание',
    university: 'Университет',
    year: 'Год',
    speciality: 'Специальность',
    notSpecified: 'Не указано',
    roleNames: {
      admin: 'Администратор',
      departmenthead: 'Заведующий кафедрой',
      teacher: 'Преподаватель',
    },
  },
  uz: {
    title: 'Xodim kartochkasi',
    generatedOn: 'Shakllantirilgan sana',
    personalInfo: "Shaxsiy ma'lumotlar",
    fullName: 'F.I.Sh.',
    login: 'Login',
    role: 'Lavozim',
    department: 'Kafedra',
    bachelorDegree: 'Bakalavriat',
    masterDegree: 'Magistratura',
    phdDegree: 'PhD ilmiy darajasi',
    academicTitle: 'Ilmiy unvon',
    university: 'Universitet',
    year: 'Yil',
    speciality: 'Mutaxassislik',
    notSpecified: 'Kiritilmagan',
    roleNames: {
      admin: 'Administrator',
      departmenthead: 'Kafedra mudiri',
      teacher: "O'qituvchi",
    },
  },
};

export function resolveAccountSummaryLang(lang?: string): AccountSummaryLang {
  return lang === 'ru' || lang === 'uz' ? lang : 'en';
}
