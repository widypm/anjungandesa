import React from "react";
import Image from "next/image";

type RelatedArticle = {
  id: string | number;
  title: string;
  excerpt?: string;
  imageUrl?: string;
};

type Article = {
  id?: string | number;
  title: string;
  imageUrl?: string;
  description?: string;
  content?: string;
};

type Props = {
  dataApi: any;
};

export default function DetailPage({ dataApi }: Props) {
  return (
    <div className="max-w-7xl mx-auto p-4 pt-28">
      {/* Hero / Title with green-blue-sky darker blurred background */}
      <div className="relative rounded-2xl overflow-hidden mb-4">
        {dataApi?.image && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={dataApi?.image}
              alt={dataApi?.title}
              layout="fill"
              objectFit="cover"
              priority={true}
              className="transform scale-105 filter blur-md opacity-50"
            />
            {/* Dark green-blue-sky gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/60 via-cyan-700/60 to-sky-900/60" />
          </div>
        )}

        <div className="p-4 md:p-4">
          <div className="backdrop-blur-sm bg-black/30 rounded-xl p-4 md:p-6 inline-block">
            <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow">
              {dataApi.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article main content */}
      <article className="bg-white/70 dark:bg-neutral-900/70 p-6 rounded-lg shadow-sm mb-8">
        {dataApi?.image && (
          <figure className="w-full h-64 md:h-96 mb-4 rounded-lg overflow-hidden relative">
            <Image
              src={dataApi?.image}
              alt={dataApi?.title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </figure>
        )}

        {/* {dataApi?.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {dataApi?.description}
          </p>
        )} */}

        {dataApi?.description ? (
          <div
            className="prose max-w-none dark:prose-invert py-4"
            dangerouslySetInnerHTML={{ __html: dataApi.description }}
          />
        ) : (
          <div className="text-gray-600 dark:text-gray-400">
            Tidak ada konten lebih lanjut.
          </div>
        )}
      </article>

      {/* Related Articles at bottom */}
      {/* <section className="bg-white/70 dark:bg-neutral-900/70 p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-4">Related Articles</h3>
        <ul className="space-y-4">
          {related.length === 0 && (
            <li className="text-sm text-gray-500">
              Tidak ada artikel terkait.
            </li>
          )}

          {related.map((r) => (
            <li key={r.id} className="flex items-start gap-3">
              <div className="w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 relative">
                {r.imageUrl ? (
                  <Image
                    src={r.imageUrl}
                    alt={r.title}
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    No Img
                  </div>
                )}
              </div>

              <div>
                <a
                  href={`#/article/${r.id}`}
                  className="block font-medium hover:underline"
                >
                  {r.title}
                </a>
                {r.excerpt && (
                  <p className="text-sm text-gray-500">{r.excerpt}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section> */}
    </div>
  );
}
