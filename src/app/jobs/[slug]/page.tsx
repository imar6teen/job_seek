import { cache } from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import JobPage from "@/components/JobPage";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: {
    slug: string;
  };
};

const getJob = cache(async (slug: string) => {
  const job = await prisma.job.findUnique({
    where: { slug },
  });

  if (!job) notFound();

  return job;
});

// just like getStaticPaths
export async function generateStaticParams() {
  const jobs = await prisma.job.findMany({
    where: {
      approved: true,
    },
    select: { slug: true },
  });

  return jobs.map(({ slug }) => slug);
}

// just like getStaticPath with fallback : blocking, default is true, this is only for learning purposes
export const dynamicParams = true;

export async function generateMetadata({
  params: { slug },
}: PageProps): Promise<Metadata> {
  const job = await getJob(slug);

  return {
    title: job.title,
  };
}

export default async function Page({ params: { slug } }: PageProps) {
  const job = await getJob(slug);

  const { applicationEmail, applicationUrl } = job;
  const applicationLink = applicationEmail
    ? `mailto:${applicationEmail}`
    : applicationUrl;

  if (!applicationLink) {
    console.error("Job has no application link or email");
    notFound();
  }

  return (
    <main className="m-auto my-10 flex max-w-5xl flex-col items-center gap-5 md:flex-row md:items-start">
      <JobPage job={job} />
      <aside>
        <Button asChild>
          <a href={applicationLink} className="w-40 md:w-fit">
            Apply now
          </a>
        </Button>
      </aside>
    </main>
  );
}
