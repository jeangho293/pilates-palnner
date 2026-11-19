/** 화면 경로 (와이어프레임 화면 id와 대응) */
export const paths = {
  login: '/login', // bo-login
  home: '/', // bo-home
  staffList: '/staff', // bo-staff-list
  staffDetail: (id: number | string) => `/staff/${id}`, // bo-staff-detail
  instructorList: '/instructors', // bo-instructor-list
  instructorEdit: (id: number | string) => `/instructors/${id}/edit`, // bo-instructor-edit
  myInstructorProfile: '/my/instructor-profile', // bo-my-instructor-profile
  customerList: '/customers', // bo-customer-list
  customerDetail: (id: number | string) => `/customers/${id}`, // bo-customer-detail
  myInfo: '/my/info', // bo-my-info
  forbidden: '/403', // bo-forbidden
} as const
