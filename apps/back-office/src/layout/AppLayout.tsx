import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { App, Avatar, Breadcrumb, Button, Dropdown, Flex, Grid, Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom'
import { onAuthEvent } from '../api/http'
import { useMe, useAuth } from '../auth/AuthContext'
import { ForbiddenView } from '../components/ForbiddenView'
import { FullPageSpin } from '../components/FullPageSpin'
import { ROLE_LABEL } from '../lib/format'
import { resolveRoles, type Crumb, type RouteHandle } from '../routes/handle'
import { paths } from '../routes/paths'
import { tokens } from '../theme/tokens'
import { CrumbContext } from './crumb'
import { buildMenuItems, findComingSoon, selectedMenuKey } from './menu'

const { Sider, Header, Content } = Layout

export function AppLayout() {
  const me = useMe()
  const { logout } = useAuth()
  const { modal, message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const matches = useMatches()
  const screens = Grid.useBreakpoint()

  // 태블릿 폭(<992px)에서는 Sider를 아이콘만 보이게 접는다
  const [collapsedByUser, setCollapsedByUser] = useState<boolean | null>(null)
  const collapsed = collapsedByUser ?? !screens.lg

  // ── 권한 ───────────────────────────────────────────
  const handles = matches.map((m) => m.handle as RouteHandle | undefined)
  const allowedRoles = resolveRoles(handles)
  const routeForbidden = !allowedRoles.includes(me.role)

  // API가 403(FORBIDDEN)을 돌려주면 지금 경로에서 같은 403 화면을 보여 준다
  const [apiForbiddenPath, setApiForbiddenPath] = useState<string | null>(null)
  const pathnameRef = useRef(location.pathname)
  useEffect(() => {
    pathnameRef.current = location.pathname
  }, [location.pathname])
  useEffect(() => onAuthEvent('forbidden', () => setApiForbiddenPath(pathnameRef.current)), [])
  const forbidden = routeForbidden || apiForbiddenPath === location.pathname

  // ── 브레드크럼 ──────────────────────────────────────
  const [pageCrumb, setPageCrumb] = useState<string | null>(null)
  const crumbs: Crumb[] = [{ title: '홈', path: paths.home }]
  if (forbidden) crumbs.push({ title: '접근 권한 없음' })
  else {
    handles.forEach((h) => h?.crumbs?.forEach((c) => crumbs.push(c)))
    if (pageCrumb) crumbs.push({ title: pageCrumb })
  }

  // ── 메뉴 ───────────────────────────────────────────
  const menuItems = useMemo(() => buildMenuItems(me.role, collapsed), [me.role, collapsed])
  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const soon = findComingSoon(key)
    if (soon) {
      message.info(`${soon.label}은(는) ${soon.release}에서 열립니다.`)
      return
    }
    navigate(key)
  }

  const confirmLogout = () => {
    modal.confirm({
      title: '로그아웃할까요?',
      content: '다시 들어오려면 이메일·비밀번호로 로그인해야 합니다.',
      okText: '로그아웃',
      cancelText: '취소',
      onOk: () => logout(),
    })
  }

  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        disabled: true,
        style: { cursor: 'default' },
        label: (
          <div style={{ padding: '4px 0' }}>
            <Typography.Text strong>{me.name}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {me.email} · {ROLE_LABEL[me.role]}
            </Typography.Text>
          </div>
        ),
      },
      { type: 'divider' },
      { key: 'my-info', icon: <UserOutlined />, label: '내 정보' },
      { key: 'logout', icon: <LogoutOutlined />, label: '로그아웃' },
    ],
    onClick: ({ key }) => {
      if (key === 'my-info') navigate(paths.myInfo)
      if (key === 'logout') confirmLogout()
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={tokens.layout.siderWidth}
        collapsedWidth={tokens.layout.siderCollapsedWidth}
        collapsed={collapsed}
        trigger={null}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          borderRight: `1px solid ${tokens.neutral.border}`,
        }}
      >
        <Link to={paths.home} className="bo-logo" aria-label="홈으로">
          <span className="bo-logo-mark">P</span>
          {!collapsed && <span className="bo-logo-text">필라테스 플래너</span>}
        </Link>
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedMenuKey(location.pathname)]}
          items={menuItems}
          onClick={onMenuClick}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${tokens.neutral.border}`,
          }}
        >
          <Button
            type="text"
            aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsedByUser(!collapsed)}
          />
          <Breadcrumb
            style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}
            items={crumbs.map((c, i) => ({
              key: `${i}-${c.title}`,
              title: c.path && i < crumbs.length - 1 ? <Link to={c.path}>{c.title}</Link> : c.title,
            }))}
          />
          <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
            <Button type="text" style={{ paddingInline: 8 }}>
              <Flex align="center" gap={8}>
                <Avatar size="small" style={{ background: tokens.brand.main }}>
                  {me.name.slice(0, 1)}
                </Avatar>
                {screens.md && (
                  <span>
                    {me.name} · {ROLE_LABEL[me.role]}
                  </span>
                )}
                <DownOutlined style={{ fontSize: 10 }} />
              </Flex>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ padding: screens.md ? '20px 24px 32px' : '16px', minWidth: 0 }}>
          <CrumbContext.Provider value={setPageCrumb}>
            <Suspense fallback={<FullPageSpin />}>
              {forbidden ? <ForbiddenView onLeave={() => setApiForbiddenPath(null)} /> : <Outlet />}
            </Suspense>
          </CrumbContext.Provider>
        </Content>
      </Layout>
    </Layout>
  )
}
