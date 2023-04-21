import { createBoard } from '@wixc3/react-board';
import { ItemWrapper } from '../../../components/item-wrapper/item-wrapper';

export default createBoard({
    name: 'ItemWrapper',
    Board: () => <ItemWrapper />
});
