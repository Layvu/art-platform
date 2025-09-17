import { PayloadService } from '@/services/api/payload-service';
import { ArtistForm } from './ArtistForm';
import { PAGES } from '@/config/public-pages.config';
import Link from 'next/link';
import Image from 'next/image';

export default async function AuthorsPage() {
    const payloadService = new PayloadService();
    const authors = await payloadService.getAuthors();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Authors</h1>
            <ArtistForm />

            <div className="grid grid-cols-4 gap-4">
                {authors.map((author) => (
                    // <AuthorCard key={author.id} {...author} /> // TODO: карточка автора / tailwind
                    <div key={author.id} className="flex flex-col gap-2 border bg-slate-200 p-4 rounded-lg my-4 mx-4">
                        <div>{author.id}</div>

                        <Link href={PAGES.AUTHOR(author.name)} className="text-blue-500 hover:underline">
                            {author.name}
                        </Link>

                        {author.bio ? <p>{author.bio.slice(0, 100)}</p> : ''}

                        {author.avatar ? <Image alt="Картинка" src={author.avatar} width={100} height={52} /> : ''}
                    </div>
                ))}
            </div>
        </div>
    );
}

// TODO: Метатеги
