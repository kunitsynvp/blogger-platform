import { Injectable } from '@nestjs/common';
import bcrypt from "bcrypt";

@Injectable()
export class CryptoService  {
    async generateHash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(password: string, dbHash: string): Promise<boolean> {
        return await bcrypt.compare(password, dbHash);
    }
}