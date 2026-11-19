import type { ThemeConfig } from 'antd'
import { tokens } from './tokens'

const { brand, neutral, semantic, font, typeScale, radius } = tokens

/** 디자인 토큰 → Ant Design ConfigProvider 매핑 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: brand.main,
    colorLink: brand.main,
    colorLinkHover: brand.mainHover,
    colorBgLayout: neutral.bg,
    colorBgContainer: neutral.surface,
    colorBgElevated: neutral.surface,
    colorBorder: neutral.border,
    colorBorderSecondary: neutral.border,
    colorText: neutral.text,
    colorTextHeading: neutral.text,
    colorTextSecondary: neutral.muted,
    colorTextDescription: neutral.muted,
    colorSuccess: semantic.success,
    colorWarning: semantic.warning,
    colorError: semantic.danger,
    colorInfo: semantic.info,
    colorInfoBg: brand.subSoft,
    colorInfoBorder: brand.subSoft,
    colorWarningBg: brand.mainSoft,
    colorWarningBorder: neutral.border,
    fontFamily: font.body,
    fontSize: typeScale.body.size,
    fontSizeSM: typeScale.caption.size,
    fontSizeHeading1: typeScale.display.size,
    fontSizeHeading2: typeScale.h1.size,
    fontSizeHeading3: typeScale.h2.size,
    fontSizeHeading4: typeScale.h3.size,
    lineHeight: typeScale.body.lineHeight,
    borderRadius: radius.md,
    borderRadiusSM: radius.sm,
    borderRadiusLG: radius.lg,
  },
  components: {
    Layout: {
      siderBg: neutral.surface2,
      headerBg: neutral.surface,
      bodyBg: neutral.bg,
      headerPadding: '0 24px',
      headerHeight: tokens.layout.headerHeight,
    },
    Menu: {
      itemBg: neutral.surface2,
      subMenuItemBg: neutral.surface2,
      itemSelectedBg: brand.mainSoft,
      itemSelectedColor: brand.mainHover,
      itemHoverBg: brand.mainSoft,
      groupTitleColor: neutral.muted,
      groupTitleFontSize: typeScale.caption.size,
    },
    Table: {
      headerBg: neutral.bg,
      rowHoverBg: brand.mainSoft,
    },
    Descriptions: {
      labelBg: neutral.bg,
    },
  },
}
