export class Prompt {
    constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly content: string,
        public readonly isFavorite: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }
}
