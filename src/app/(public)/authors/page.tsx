import { PayloadService } from '@/services/api/payload-service';

import AuthorsUI from './AuthorsUI';

export default async function AuthorsPage() {
    const payloadService = new PayloadService();
    const authors = await payloadService.getAuthors();

    return <AuthorsUI authors={authors} />;
}

// TODO: Метатеги
