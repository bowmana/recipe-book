import { createBoard } from '@wixc3/react-board';
import { ItemWrapper } from '../../../components/new-recipe-page/item-wrapper/item-wrapper';

export default createBoard({
    name: 'ItemWrapper',
    Board: () => <ItemWrapper />,
});
