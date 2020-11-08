create table products (
	id uuid primary key DEFAULT uuid_generate_v4 (),
	title text not null,
	description text,
	price integer
);

create table stocks (
	product_id uuid primary key,
	count integer,
	constraint fk_productid foreign key (product_id) references products (id)
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";