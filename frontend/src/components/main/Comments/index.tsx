import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import Loader from '~/components/shared/Loader';
import { commentOnPost, getComments } from "~/services/api";
import { IComment, IFetchParams, IRootReducer } from "~/types/types";
import CommentOptions from '../Options/CommentOptions';

dayjs.extend(relativeTime);

interface IProps {
    postID: string;
}

const Comments: React.FC<IProps> = ({ postID }) => {
    const [comments, setComments] = useState<any>({
        items: [],
        commentsCount: 0
    });
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const user = useSelector((state: IRootReducer) => state.auth);
    const [commentBody, setCommentBody] = useState('');

    useEffect(() => {
        fetchComment({ offset: 0, limit: 1, sort: 'desc' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchComment = async (params: IFetchParams) => {
        try {
            setIsLoading(true);
            const { comments: fetchedComments, commentsCount } = await getComments(postID, params);
            console.log(comments);
            setOffset(offset + 1);
            setComments({ items: [...fetchedComments.reverse(), ...comments.items], commentsCount });
            setIsLoading(false);
        } catch (e) {
            console.log('CANT GET COMMENTS', e);
            setIsLoading(false);
            setError(e.error.message);
        }
    };

    const handleCommentBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCommentBody(val);
    };

    const handleSubmitComment = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && commentBody) {
            try {
                const comment = await commentOnPost(postID, commentBody);

                setComments({ ...comments, items: [...comments.items, comment] });
                // TODO ----
                setCommentBody('');
            } catch (e) {

            }

        }
    };

    return (
        <>
            <div className="bg-white rounded-b-md">
                {(!error && comments.items.length !== 0) && (
                    <span
                        className="text-indigo-700 font-bold cursor-pointer inline-block p-2"
                        onClick={() => fetchComment({
                            offset: 1,
                            limit: 10,
                            skip: comments.items.length === 1 ? 1 : undefined,
                            sort: 'asc'
                        })}
                    >
                        {isLoading ? <Loader /> : 'Load previous comments'}
                    </span>
                )}
                {(error !== null && comments.commentsCount !== 0) && (
                    <div className="py-4 px-2 mt-6 space-y-2 divide-y divide-gray-200">
                        {/* ----- COMMENT LIST ---------- */}
                        {comments.items.map((comment: IComment) => (
                            <div
                                className="flex py-2"
                                key={comment.id}
                            >
                                <Link to={`/${comment.author.username}`} className="mr-2">
                                    <div
                                        className="w-10 h-10 !bg-cover !bg-no-repeat rounded-full"
                                        style={{ background: `#f8f8f8 url(${comment.author.profilePicture || 'https://i.pravatar.cc/60?' + new Date().getTime()}` }}
                                    />
                                </Link>
                                <div className="flex flex-col flex-grow">
                                    <Link to={`/${comment.author.username}`}>
                                        <h5>{comment.author.username}</h5>
                                    </Link>
                                    <p className="text-gray-800">{comment.body}</p>
                                    <span className="text-xs text-gray-400 mt-2">{dayjs(comment.createdAt).fromNow()}</span>
                                </div>
                                <CommentOptions />
                            </div>
                        ))}
                    </div>
                )}
                {/*  ---- INPUT COMMENT ----- */}
                <div className="flex items-center py-4 px-2 mt-4 ">
                    <div
                        className="w-10 h-10 !bg-cover !bg-no-repeat rounded-full mr-2"
                        style={{ background: `#f8f8f8 url(${user.profilePicture || 'https://i.pravatar.cc/60?' + new Date().getTime()}` }}
                    />
                    <input
                        className="flex-grow"
                        type="text"
                        placeholder="Write a comment..."
                        readOnly={isLoading}
                        onChange={handleCommentBodyChange}
                        onKeyDown={handleSubmitComment}
                    />
                </div>
            </div>
        </>
    );
};

export default Comments;
