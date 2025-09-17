import { postForm } from '@/server-actions/post-form';

export function ArtistForm() {
    return (
        <form action={postForm} className="w-80">
            <input
                name="content"
                placeholder="Ты кто такой?"
                className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <button type="submit" className="w-full py-2 mt-2 bg-blue-600 text-white rounded hover:cursor-pointer">
                Отправить
            </button>
        </form>
    );
}
