"use client";

/**
 * A form that asks before it destroys something.
 *
 * Deleting a post or a comment was a single click with no confirmation, next
 * to buttons that are not destructive at all. The admin surface has had
 * DeleteButton for this since the beginning; the feed did not, which is the
 * side where the mistake is most likely — the control sits inside a card
 * someone is scrolling past.
 *
 * It wraps rather than replaces the button so each caller keeps its own
 * wording and styling: "Supprimer" on your own post, "Masquer" on someone
 * else's, "×" on a comment.
 */
export default function ConfirmSubmit({
  action,
  confirm,
  className = "",
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirm: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
