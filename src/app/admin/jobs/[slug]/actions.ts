"use server";

import { isAdmin } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { redirect } from "next/navigation";

type FormState =
  | {
      error?: string;
    }
  | undefined;

export async function approveSubmission(
  // prevState just for remove the error in adminSidebar useFormState
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const jobId = parseInt(formData.get("jobId") as string);

    const user = await currentUser();

    if (!user || !isAdmin(user)) throw new Error("Not authorized");

    await prisma.job.update({
      where: { id: jobId },
      data: { approved: true },
    });

    // this is used for revalidatePath so next.js will pre render to static pages so it is cached.
    // this will reload the page when it is triggered
    revalidatePath("/");
  } catch (error) {
    // this must be passed to another variable because Next.js will remove the error instance when an error is being passed to the client
    let message = "Unexpected Error";
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      error: message,
    };
  }
}

export async function deleteJob(prevState: FormState, formData: FormData) {
  try {
    const jobId = parseInt(formData.get("jobId") as string);

    const user = await currentUser();

    if (!user || !isAdmin(user)) throw new Error("Not authorized");

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (job?.companyLogoUrl) await del(job.companyLogoUrl);

    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath("/");
  } catch (err) {
    // this must be passed to another variable because Next.js will remove the error instance when an error is being passed to the client
    let message = "Unexpected Error";
    if (err instanceof Error) {
      message = err.message;
    }
    return {
      error: message,
    };
  }
  redirect("/admin");
}
