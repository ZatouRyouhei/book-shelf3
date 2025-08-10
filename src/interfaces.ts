export interface UserType {
	id: string
	password: string
	name: string
	roleName: string
	token: string
}

export interface GenreType {
	id: number
	name: string
}
export interface BookType {
	userId: string
	seqNo: number
	title: string
	author: string
	price: number
	publisher: string
	published: string
	buyDate: string
	completeDate: string
	genre: GenreType
	memo: string
	rate: number
	imgUrl: string
	infoUrl: string
}
export interface BookFormType {
	seqNo: number,
    image: string,
    title: string,
    price: number,
    author: string,
    publisher: string,
    published: string,
	buyDate: string,
    completeDate: string,
    memo: string,
    rate: number,
    genre: number,
    info: string
}

export interface SearchCondType {
	userId: string
	title: string
	author: string
	completeDateFrom: string
	completeDateTo: string
	genre: number
	rate: number
}

export interface GoogleBookType {
	id: string
	title: string
	author: string
	price: string
	publisher: string
	published: string
	image: string
	info: string
}