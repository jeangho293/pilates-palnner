import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { RequireAuth } from './RequireAuth'
import { Root } from './Root'
import { ADMIN_ONLY, ALL_ROLES, INSTRUCTOR_ONLY, type RouteHandle } from './handle'
import { paths } from './paths'

const h = (handle: RouteHandle) => handle

const center = { title: '센터 관리' }

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: paths.login,
        lazy: async () => ({ Component: (await import('../pages/LoginPage')).LoginPage }),
      },
      {
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            handle: h({ roles: ALL_ROLES }),
            lazy: async () => ({ Component: (await import('../pages/HomePage')).HomePage }),
          },
          {
            path: 'staff',
            handle: h({ roles: ADMIN_ONLY, crumbs: [center, { title: '직원 관리', path: paths.staffList }] }),
            children: [
              {
                index: true,
                lazy: async () => ({ Component: (await import('../pages/staff/StaffListPage')).StaffListPage }),
              },
              {
                path: ':staffId',
                lazy: async () => ({
                  Component: (await import('../pages/staff/StaffDetailPage')).StaffDetailPage,
                }),
              },
            ],
          },
          {
            path: 'instructors',
            handle: h({
              roles: ADMIN_ONLY,
              crumbs: [center, { title: '강사 프로필', path: paths.instructorList }],
            }),
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('../pages/instructors/InstructorListPage')).InstructorListPage,
                }),
              },
              {
                path: ':instructorId/edit',
                lazy: async () => ({
                  Component: (await import('../pages/instructors/InstructorEditPage')).InstructorEditPage,
                }),
              },
            ],
          },
          {
            path: 'customers',
            handle: h({ roles: ADMIN_ONLY, crumbs: [center, { title: '고객', path: paths.customerList }] }),
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('../pages/customers/CustomerListPage')).CustomerListPage,
                }),
              },
              {
                path: ':customerId',
                lazy: async () => ({
                  Component: (await import('../pages/customers/CustomerDetailPage')).CustomerDetailPage,
                }),
              },
            ],
          },
          {
            path: 'my/instructor-profile',
            handle: h({ roles: INSTRUCTOR_ONLY, crumbs: [{ title: '강사' }, { title: '내 강사 프로필' }] }),
            lazy: async () => ({
              Component: (await import('../pages/instructors/MyInstructorProfilePage')).MyInstructorProfilePage,
            }),
          },
          {
            path: 'my/info',
            handle: h({ roles: ALL_ROLES, crumbs: [{ title: '계정' }, { title: '내 정보' }] }),
            lazy: async () => ({ Component: (await import('../pages/account/MyInfoPage')).MyInfoPage }),
          },
          {
            path: '403',
            handle: h({ crumbs: [{ title: '접근 권한 없음' }] }),
            lazy: async () => ({ Component: (await import('../pages/ForbiddenPage')).ForbiddenPage }),
          },
          {
            path: '*',
            handle: h({ crumbs: [{ title: '페이지 없음' }] }),
            lazy: async () => ({ Component: (await import('../pages/NotFoundPage')).NotFoundPage }),
          },
        ],
      },
    ],
  },
])
