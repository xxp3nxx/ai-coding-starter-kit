"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

// Local form schema (token is injected, not user-entered)
const inviteFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be 100 characters or less"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type InviteFormInput = z.infer<typeof inviteFormSchema>;

interface InvitationDetails {
  email: string;
  centreId: string;
  expiresAt: string;
}

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<InviteFormInput>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      fullName: "",
      password: "",
    },
  });

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(
          `/api/invitations/accept?token=${encodeURIComponent(token)}`
        );
        const result = await response.json();

        if (!response.ok) {
          setInviteError(
            result.error || "This invitation link is invalid or has expired."
          );
          return;
        }

        setInvitation(result.invitation);
      } catch {
        setInviteError("Failed to load invitation details. Please try again.");
      } finally {
        setIsLoadingInvite(false);
      }
    }

    fetchInvitation();
  }, [token]);

  async function onSubmit(data: InviteFormInput) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          fullName: data.fullName,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.error || "Failed to accept invitation. Please try again."
        );
        return;
      }

      setIsSuccess(true);
      toast.success("Account created successfully!");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state
  if (isLoadingInvite) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (inviteError) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Invitation unavailable</CardTitle>
          <CardDescription>{inviteError}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Please contact your fitness centre admin to request a new
            invitation.
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Account created</CardTitle>
          <CardDescription>
            Your trainer account has been set up. Please check your email to
            confirm your account, then log in.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/login">Go to login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">You&apos;re invited!</CardTitle>
        <CardDescription>
          Set up your trainer account to start managing classes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-md border bg-muted/50 px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            Invitation for{" "}
            <span className="font-medium text-foreground">
              {invitation?.email}
            </span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jane Doe"
                      autoComplete="name"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Creating account..." : "Accept invitation"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
