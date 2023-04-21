import { createBoard } from '@wixc3/react-board';
import { Item } from '../../../components/item/item';

export default createBoard({
    name: 'Item',
    Board: () => <Item />
});
