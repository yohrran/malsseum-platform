import { Helmet } from 'react-helmet-async';

type Props = {
  title?: string;
  description?: string;
};

export const SEOHead = ({
  title = '매일 말씀',
  description = '매일 성경을 읽고 묵상하는 통독 플랫폼',
}: Props) => {
  const fullTitle = title === '매일 말씀' ? title : `${title} | 매일 말씀`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};
