with data(id, title, description, price, img, count) as (
	values (
			uuid_generate_v4 (),
			'Крылья: Птицы Европы',
			'Дополнение',
			87,
			'https://igraj.by/upload/iblock/f5a/f5a48e0762001ad9be2371423df702ab.jpg',
			4
		),
		(
			uuid_generate_v4 (),
			'Маракайбо',
			'Маракайбо описание',
			175,
			'https://igraj.by/upload/Sh/imageCache/6ac/511/2f4c76754a96582d6db19f00e72a312e.jpg',
			6
		),
		(
			uuid_generate_v4 (),
			'Соображарий Супер',
			'Соображарий описание',
			17,
			'https://igraj.by/upload/Sh/imageCache/86d/efa/f6f4124a393a4c6c0a641c0625ae4368.jpg',
			7
		),
		(
			uuid_generate_v4 (),
			'Цивилизация Сида Мейера: Новый рассвет. Терра инкогнита',
			'Цивилизация описание',
			116,
			'https://igraj.by/upload/Sh/imageCache/259/95a/420580760fcf1a89aac7c1929b2860f6.jpg',
			12
		)
),
ins1 as (
	insert into products (id, title, description, price, img)
	select id,
		title,
		description,
		price,
		img
	from data
	returning id as product_id
)
INSERT INTO stocks (product_id, count)
SELECT data.id,
	data.count
FROM data
returning product_id;

create extension if not exists "uuid-ossp";