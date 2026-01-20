import React from 'react';

interface Comment {
  date: string;
  user: string;
  action: string;
}

interface CommentsListProps {
  comments: Comment[];
}

export function CommentsList({ comments }: CommentsListProps) {
  return (
    <div>
      {comments.map((c, i) => (
        <div key={i} className="mb-2">
          <div className="text-xs text-gray-500">{c.date} — {c.user}</div>
          <div className="text-sm">{c.action}</div>
        </div>
      ))}
    </div>
  );
}
