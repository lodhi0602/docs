import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import cx from 'classnames'
import { LinkExternalIcon } from '@primer/octicons-react'

import { Alert } from 'src/frame/components/ui/Alert'
import { DefaultLayout } from 'src/frame/components/DefaultLayout'
import { ArticleTitle } from 'src/frame/components/article/ArticleTitle'
import { useArticleContext } from 'src/frame/components/context/ArticleContext'
import { LearningTrackNav } from 'src/learning-track/components/article/LearningTrackNav'
import { MarkdownContent } from 'src/frame/components/ui/MarkdownContent'
import { Lead } from 'src/frame/components/ui/Lead'
import { PermissionsStatement } from 'src/frame/components/ui/PermissionsStatement'
import { ArticleGridLayout } from './ArticleGridLayout'
import { ArticleInlineLayout } from './ArticleInlineLayout'
import { PlatformPicker } from 'src/tools/components/PlatformPicker'
import { ToolPicker } from 'src/tools/components/ToolPicker'
import { MiniTocs } from 'src/frame/components/ui/MiniTocs'
import { LearningTrackCard } from 'src/learning-track/components/article/LearningTrackCard'
import { RestRedirect } from 'src/rest/components/RestRedirect'
import { Breadcrumbs } from 'src/frame/components/page-header/Breadcrumbs'
import { Link } from 'src/frame/components/Link'
import { useTranslation } from 'src/languages/components/useTranslation'
import { LinkPreviewPopover } from 'src/links/components/LinkPreviewPopover'

const ClientSideRefresh = dynamic(() => import('src/frame/components/ClientSideRefresh'), {
  ssr: false,
})
const isDev = process.env.NODE_ENV === 'development'

export const ArticlePage = () => {
  const router = useRouter()
  const {
    title,
    intro,
    effectiveDate,
    renderedPage,
    permissions,
    includesPlatformSpecificContent,
    includesToolSpecificContent,
    product,
    productVideoUrl,
    miniTocItems,
    currentLearningTrack,
    supportPortalVaIframeProps,
    currentLayout,
  } = useArticleContext()
  const isLearningPath = !!currentLearningTrack?.trackName
  const { t } = useTranslation(['pages'])

  const introProp = (
    <>
      {intro && (
        // Note the `_page-intro` is used by the popover preview cards
        // when it needs this text for in-page links.
        <Lead data-testid="lead" data-search="lead" className="_page-intro">
          {intro}
        </Lead>
      )}
    </>
  )

  const introCalloutsProp = (
    <>
      {permissions && <PermissionsStatement permissions={permissions} />}

      {includesPlatformSpecificContent && <PlatformPicker />}
      {includesToolSpecificContent && <ToolPicker />}

      {product && <Alert className="mb-4" html={product} />}
    </>
  )

  const toc = (
    <>
      {isLearningPath && <LearningTrackCard track={currentLearningTrack} />}
      {miniTocItems.length > 1 && <MiniTocs miniTocItems={miniTocItems} />}
    </>
  )

  const articleContents = (
    <div id="article-contents">
      {productVideoUrl && (
        <div className="my-2">
          <Link id="product-video" href={productVideoUrl} target="_blank">
            <LinkExternalIcon aria-label="(external site)" className="octicon-link mr-2" />
            {t('video_from_transcript')}
          </Link>
        </div>
      )}

      <MarkdownContent>{renderedPage}</MarkdownContent>
      {effectiveDate && (
        <div className="mt-4" id="effectiveDate">
          Effective as of:{' '}
          <time dateTime={new Date(effectiveDate).toISOString()}>
            {new Date(effectiveDate).toDateString()}
          </time>
        </div>
      )}
    </div>
  )

  return (
    <DefaultLayout>
      <LinkPreviewPopover />
      {isDev && <ClientSideRefresh />}
      {router.pathname.includes('/rest/') && <RestRedirect />}
      {currentLayout === 'inline' ? (
        <ArticleInlineLayout
          supportPortalVaIframeProps={supportPortalVaIframeProps}
          topper={<ArticleTitle>{title}</ArticleTitle>}
          intro={introProp}
          introCallOuts={introCalloutsProp}
          toc={toc}
          breadcrumbs={<Breadcrumbs />}
        >
          {articleContents}
        </ArticleInlineLayout>
      ) : (
        <div className="container-xl px-3 px-md-6 my-4">
          <div className={cx('d-none d-xxl-block mt-3 mr-auto width-full')}>
            <Breadcrumbs />
          </div>

          <ArticleGridLayout
            supportPortalVaIframeProps={supportPortalVaIframeProps}
            topper={<ArticleTitle>{title}</ArticleTitle>}
            intro={
              <>
                {introProp}
                {introCalloutsProp}
              </>
            }
            toc={toc}
          >
            {articleContents}
          </ArticleGridLayout>

          {isLearningPath ? (
            <div className="mt-4">
              <LearningTrackNav track={currentLearningTrack} />
            </div>
          ) : null}
        </div>
      )}
    </DefaultLayout>
  )
}
