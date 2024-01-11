import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Select from "./ui/select";
import prisma from "@/lib/prisma";
import { jobTypes } from "@/lib/job-types";
import { Button } from "./ui/button";
import { JobFilterValues, jobFilterSchema } from "@/lib/validation";
import { redirect } from "next/navigation";
import FormSubmitButton from "./FormSubmitButton";

// specify "use server" if the component is client component ("use client")
async function filterJobs(formData: FormData) {
  "use server";
  const values = Object.fromEntries(formData.entries());
  const { q, type, location, remote } = jobFilterSchema.parse(values);

  const searchParams = new URLSearchParams({
    ...(q && { q: q.trim() }),
    ...(type && { type }),
    ...(location && { location }),
    ...(remote && { remote: "true" }),
  });

  redirect(`/?${searchParams.toString()}`);
}

type JobFilterSidebarProps = {
  defaultValues: JobFilterValues;
};

async function JobFilterSidebar({ defaultValues }: JobFilterSidebarProps) {
  const distinctLocation = (await prisma.job
    .findMany({
      where: {
        approved: true,
      },
      select: { location: true },
      distinct: ["location"],
    })
    .then((locations) =>
      locations
        .map(({ location }) => location)
        .filter((location) => location !== null),
    )) as string[];

  return (
    <aside className="sticky top-0 h-fit rounded-lg border bg-background p-4 md:w-[16.25rem]">
      <form action={filterJobs}>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="q">Search</Label>
            <Input
              name="q"
              id="q"
              placeholder="Title, company, etc."
              defaultValue={defaultValues.q}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Job Types</Label>
            <Select
              id="type"
              name="type"
              defaultValue={defaultValues.type || ""}
            >
              <option value="">All Types</option>
              {jobTypes.map((type, idx) => (
                <option key={idx} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Select
              id="location"
              name="location"
              defaultValue={defaultValues.location || ""}
            >
              <option value="">All locations</option>
              {distinctLocation.map((location, idx) => (
                <option key={idx} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="remote"
              name="remote"
              type="checkbox"
              className="scale-125 accent-black"
              defaultChecked={defaultValues.remote}
            />
            <Label htmlFor="remote">Remote jobs</Label>
          </div>
          <FormSubmitButton className="w-full">Filter Jobs</FormSubmitButton>
        </div>
      </form>
    </aside>
  );
}

export default JobFilterSidebar;
