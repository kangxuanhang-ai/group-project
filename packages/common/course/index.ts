
export interface Course {
    id: string; // 课程id
    name: string; // 课程名称
    value: string; // 课程标识
    description: string;
    teacher: string;
    url: string; // 课程地址
    price: number; // 课程价格
}

export type CourseList = Course[];
