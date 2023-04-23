import { createBoard } from '@wixc3/react-board';
import { Item } from '../../../components/new-recipe-page/item/item';

export default createBoard({
    name: 'Item',
    Board: () => <Item />,
});
