import classNames from 'classnames';
import styles from './update-item-wrapper.module.scss';
import { EditItemForm } from '../../shared-components/edit-item-form';
import { Item } from '../../shared-components/item';

import { ItemForm } from '../../shared-components/item-form';
import { v4 as UUID } from 'uuid';
import { useParams } from 'react-router-dom';
import { Dropdown } from '../../util-components/dropdown';
import { ImageUpload } from '../../util-components/imageupload';
import { LoadingModal } from '../../util-components/loadingmodal';
import { EditableRecipeItem, Option, EditableInstruction } from '../../types';
import { useState, useEffect } from 'react';
import { InstructionForm } from '../../shared-components/instruction-form';
import { Instruction } from '../../shared-components/instruction';
import { EditInstructionForm } from '../../shared-components/edit-instruction-form';

import axios, { AxiosError, AxiosResponse } from 'axios';

export interface ItemWrapperProps {
    className?: string;
}

export const UpdateItemWrapper = ({ className }: ItemWrapperProps) => {
    const { recipe_id } = useParams<{ recipe_id: string }>();
    const [recipe_items, setRecipeItems] = useState<EditableRecipeItem[]>([]);
    const [recipe_name, setRecipeName] = useState<string>('');
    const [recipe_cuisine, setRecipeCuisine] = useState<Option | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [recipe_type, setRecipeType] = useState<Option | null>(null);
    const [editRecipeCuisine, setEditRecipeCuisine] = useState(false);
    const [editRecipeType, setEditRecipeType] = useState(false);
    const [recipe_description, setRecipeDescription] = useState<string>('');
    const [recipe_images, setRecipeImages] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [user_id, setUserID] = useState(0);
    const [user_name, setUserName] = useState('');
    const [recipe_instructions, setRecipeInstructions] = useState<EditableInstruction[]>([]);

    // const [original_u_id, setOriginalUId] = useState(0);
    // const [original_u_name, setOriginalUName] = useState('');
    useEffect(() => {
        const auth = async () => {
            const url =
                process.env.NODE_ENV === 'production'
                    ? 'http://localhost:4001/auth' // Change if actually deployed to real web server
                    : 'http://localhost:4001/auth';

            await axios
                .post(url, {}, { withCredentials: true })
                .then((axiosResponse: AxiosResponse) => {
                    setUserID(axiosResponse.data.user_id);
                    setUserName(axiosResponse.data.user_name);
                })
                .catch((axiosError: AxiosError) => {
                    window.location.href = '/login';
                });
        };

        auth();
    }, []);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/recipes/${recipe_id}`);
                console.log(response.data, 'recipe data');
                const fetchedRecipeItems = (response.data.recipe_items || []).map(
                    (item: EditableRecipeItem) => ({
                        recipe_item_id: item.recipe_item_id,
                        recipe_item: item.recipe_item,
                        portion_size: item.portion_size,
                        isEditing: false, // Add the "isEditing" property
                    })
                );
                const fetchedRecipeInstructions = (response.data.recipe_instructions || []).map(
                    (instruction: EditableInstruction) => ({
                        instruction_id: instruction.instruction_id,
                        instruction: instruction.instruction,
                        isEditing: false, // Add the "isEditing" property
                        instruction_order: instruction.instruction_order,
                    })
                );

                setRecipeDescription(response.data.recipe_description);
                setRecipeName(response.data.recipe_name);

                setRecipeImages(response.data.recipe_images);

                setRecipeItems(fetchedRecipeItems);

                setRecipeCuisine({
                    value: response.data.recipe_cuisine,
                    label: response.data.recipe_cuisine,
                });
                setRecipeType({
                    value: response.data.recipe_type,
                    label: response.data.recipe_type,
                });

                setRecipeInstructions(fetchedRecipeInstructions);
                // setOriginalUId(response.data.original_u_id);
                // setOriginalUName(response.data.original_u_name);

                console.log(response.data, 'response data on update item wrapper');
                console.log(recipe_items, 'recipe items yooo');
                // console.log(fetchedRecipeItems);
            } catch (error) {
                console.log('Failed to fetch recipes');
                console.log(error);
            }
        };
        fetchRecipes();
    }, [recipe_id]);
    const [showInstructionForm, setShowInstructionForm] = useState<boolean>(
        recipe_instructions.length === 0
    );
    const [showDropDown, setShowDropDown] = useState<boolean>(
        recipe_cuisine !== null || recipe_type !== null
    );
    const [showDescriptionForm, setShowDescriptionForm] = useState<boolean>(
        recipe_description === null
    );

    const toggleInstructionForm = () => {
        if (showInstructionForm) {
            setRecipeInstructions([]);
        }
        setShowInstructionForm(!showInstructionForm);
    };
    const toggleDropDown = () => {
        if (showDropDown) {
            setRecipeCuisine(null);
            setRecipeType(null);
        }

        setShowDropDown(!showDropDown);
    };
    const toggleDescriptionForm = () => {
        if (showDescriptionForm) {
            setRecipeDescription('');
        }

        setShowDescriptionForm(!showDescriptionForm);
    };

    const deleteRecipeInstruction = (id: string) => {
        const updatedRecipeInstructions = recipe_instructions.filter(
            (instruction) => instruction.instruction_id !== id
        );
        // Update the instruction_order of the remaining instructions
        const updatedInstructionsWithIndex = updatedRecipeInstructions.map(
            (instruction, index) => ({
                ...instruction,
                instruction_order: index + 1,
            })
        );
        setRecipeInstructions(updatedInstructionsWithIndex);
    };

    const addRecipeInstruction = (instruction: string) => {
        const newItem: EditableInstruction = {
            instruction_id: UUID(),
            instruction,
            isEditing: false,
            instruction_order: recipe_instructions.length + 1,
        };

        setRecipeInstructions([...recipe_instructions, newItem]);
    };

    const addRecipeItem = async (recipe_item: string, portion_size: string) => {
        try {
            const newItem: EditableRecipeItem = {
                recipe_item_id: UUID(),
                recipe_item,
                portion_size,
                isEditing: false,
            };

            setRecipeItems([...recipe_items, newItem]);
            console.log(recipe_items, 'new item added');
        } catch (error) {
            console.log('Failed to add recipe item');
            console.log(error);
        }
    };

    const deleteRecipeItem = (id: string) => {
        const updatedRecipeItems = recipe_items.filter((item) => item.recipe_item_id !== id);
        setRecipeItems(updatedRecipeItems);
    };

    const addRecipeDescription = (recipe_description: string) => {
        setRecipeDescription(recipe_description);
    };
    const editRecipeItem = (id: string) => {
        setRecipeItems(
            recipe_items.map((item: EditableRecipeItem) => {
                return item.recipe_item_id === id
                    ? {
                          ...item,
                          isEditing: !item.isEditing,
                      }
                    : item;
            })
        );
    };
    const editRecipeInstruction = (id: string) => {
        setRecipeInstructions(
            recipe_instructions.map((instruction: EditableInstruction) => {
                return instruction.instruction_id === id
                    ? {
                          ...instruction,

                          isEditing: !instruction.isEditing,
                      }
                    : instruction;
            })
        );
    };

    const saveRecipeItem = (recipe_item: string, recipe_portion: string, id: string) => {
        setRecipeItems(
            recipe_items.map((item: EditableRecipeItem) => {
                return item.recipe_item_id === id
                    ? {
                          ...item,
                          recipe_item,
                          portion_size: recipe_portion,
                          isEditing: !item.isEditing,
                      }
                    : item;
            })
        );
    };
    const saveRecipeInstruction = (instruction: string, id: string) => {
        setRecipeInstructions(
            recipe_instructions.map((item: EditableInstruction) => {
                return item.instruction_id === id
                    ? {
                          ...item,
                          instruction,

                          isEditing: !item.isEditing,
                      }
                    : item;
            })
        );
    };

    const updateRecipe = async () => {
        if (!recipe_name) {
            alert('Please enter a recipe name');
            return;
        }
        if (recipe_name.length > 50) {
            alert('Please enter a recipe name less than 50 characters');
            return;
        }
        if (recipe_name.length < 3) {
            alert('Please enter a recipe name more than 3 characters');
            return;
        }
        if (!images.length) {
            alert('Please upload at least one image');
            return;
        }
        if (recipe_items.length < 1) {
            alert('Please add at least one ingredient');
            return;
        }
        setIsUploading(true);
        const formData = new FormData();

        images.forEach((image) => {
            formData.append('recipe_images', image);
        });
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: any) => {
                const { loaded, total } = progressEvent;
                const percent = Math.floor((loaded * 100) / total);
                setUploadProgress(percent);
            },
        };
        recipe_items.forEach((item, index) => {
            formData.append(`recipe_items[${index}][recipe_item]`, item.recipe_item);
            formData.append(`recipe_items[${index}][portion_size]`, item.portion_size);
        });
        recipe_instructions.forEach((instruction, index) => {
            formData.append(`recipe_instructions[${index}][instruction]`, instruction.instruction);
            formData.append(
                `recipe_instructions[${index}][instruction_order]`,
                (index + 1).toString()
                // `recipe_instructions[${index}][instruction_order]`,
                // instruction.instruction_order.toString()
            );
        });
        formData.append('recipe_name', recipe_name);
        formData.append('recipe_cuisine', recipe_cuisine?.value || '');
        formData.append('recipe_type', recipe_type?.value || '');
        formData.append('recipe_description', recipe_description);
        formData.append('u_name', user_name);
        formData.append('u_id', user_id.toString());

        try {
            const response = await axios.put(
                `http://localhost:4000/${user_id}/recipes/${recipe_id}`,
                formData,
                config
            );
            window.location.href = '/home';
            setIsUploading(false);
            console.log(response);
        } catch (error) {
            console.log(error);
            setIsUploading(false);
        }
    };

    const clearRecipe = () => {
        setRecipeItems([]);
    };
    const updateName = (e: any) => {
        if (e.target.value.length > 50) {
            alert('Please enter a recipe name less than 50 characters');
            return;
        }
        setRecipeName(e.target.value);
    };

    const addRecipeCuisine = (recipe_cuisine: Option | null) => {
        setRecipeCuisine(recipe_cuisine);
        toggleEditRecipeCuisine();
    };

    const addRecipeType = (recipe_type: Option | null) => {
        setRecipeType(recipe_type);
        toggleEditRecipeType();
    };
    const toggleEditRecipeCuisine = () => {
        setEditRecipeCuisine(!editRecipeCuisine);
    };

    const toggleEditRecipeType = () => {
        setEditRecipeType(!editRecipeType);
    };

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles['recipe-card']}>
                <div className={styles['recipe-card-header']}>
                    <form>
                        <label>
                            Recipe Name:
                            <input type="text" name="name" onChange={updateName} />
                        </label>
                    </form>
                    <button className={styles['recipe-card-buttons']} onClick={updateRecipe}>
                        Update
                    </button>
                    <button className={styles['recipe-card-buttons']} onClick={clearRecipe}>
                        Clear
                    </button>
                </div>
                {isUploading && (
                    <div className={styles['upload-progress']}>
                        <LoadingModal
                            uploadProgress={uploadProgress}
                            isOpen={isUploading}
                            onRequestclose={() => {}}
                        />
                    </div>
                )}
                <div className={styles['recipe-card-line-separator']}> </div>
                <ImageUpload maxImages={5} addImages={setImages} retrievedImages={recipe_images} />
                <div className={'line-separator'}> </div>
                <div className={styles['recipe-toggles']}>
                    <button className={'small-button'} onClick={toggleDropDown}>
                        {showDropDown ? (
                            <>
                                <span> Remove Recipe Cuisine and Type </span>
                                <span className={'optional-text'}>X</span>
                            </>
                        ) : (
                            <>
                                <span> Add Recipe Cuisine and Type </span>
                                <span className={'optional-text'}>Optional</span>
                            </>
                        )}
                    </button>
                    <button className={'small-button'} onClick={toggleDescriptionForm}>
                        {showDescriptionForm ? (
                            <>
                                <span> Remove Recipe Description </span>
                                <span className={'optional-text'}>X</span>
                            </>
                        ) : (
                            <>
                                <span> Add Recipe Description </span>
                                <span className={'optional-text'}>Optional</span>
                            </>
                        )}
                    </button>
                    <button className={'small-button'} onClick={toggleInstructionForm}>
                        {showInstructionForm ? (
                            <>
                                <span> Remove Recipe Instructions </span>
                                <span className={'optional-text'}>X</span>
                            </>
                        ) : (
                            <>
                                <span> Add Recipe Instructions </span>
                                <span className={'optional-text'}>Optional</span>
                            </>
                        )}
                    </button>
                </div>
                {showDropDown && (
                    <>
                        <div className={'line-separator'}> </div>
                        <div className={styles['recipe-genre-dropdown']}>
                            {editRecipeCuisine ? (
                                <div className={styles['dropdown-container']}>
                                    <Dropdown
                                        initialOptions={[
                                            { value: 'Italian', label: 'Italian' },
                                            { value: 'Mexican', label: 'Mexican' },
                                            { value: 'American', label: 'American' },
                                            { value: 'French', label: 'French' },
                                            { value: 'Chinese', label: 'Chinese' },
                                            { value: 'Japanese', label: 'Japanese' },
                                            { value: 'Indian', label: 'Indian' },
                                            { value: 'Thai', label: 'Thai' },
                                            { value: 'Spanish', label: 'Spanish' },
                                            { value: 'Greek', label: 'Greek' },
                                            { value: 'Lebanese', label: 'Lebanese' },
                                            { value: 'Moroccan', label: 'Moroccan' },
                                            { value: 'Brazilian', label: 'Brazilian' },
                                            { value: 'Korean', label: 'Korean' },
                                            { value: 'Vietnamese', label: 'Vietnamese' },
                                            { value: 'Turkish', label: 'Turkish' },
                                            { value: 'German', label: 'German' },
                                            { value: 'Ethiopian', label: 'Ethiopian' },
                                            { value: 'Peruvian', label: 'Peruvian' },
                                            { value: 'Russian', label: 'Russian' },
                                            { value: 'Jamaican', label: 'Jamaican' },
                                            { value: 'Egyptian', label: 'Egyptian' },
                                            { value: 'British', label: 'British' },
                                            { value: 'Israeli', label: 'Israeli' },
                                            { value: 'Indonesian', label: 'Indonesian' },
                                            { value: 'Irish', label: 'Irish' },
                                            { value: 'Argentine', label: 'Argentine' },
                                            { value: 'Swedish', label: 'Swedish' },
                                            { value: 'Australian', label: 'Australian' },
                                            { value: 'Malaysian', label: 'Malaysian' },
                                        ]}
                                        onChange={addRecipeCuisine}
                                        retrievedSelected={recipe_cuisine}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <span>{recipe_cuisine ? recipe_cuisine.label : ''}</span>
                                    <button onClick={toggleEditRecipeCuisine}>Edit</button>
                                </div>
                            )}
                            {editRecipeType ? (
                                <div className={styles['dropdown-container']}>
                                    <Dropdown
                                        initialOptions={[
                                            { value: 'Breakfast', label: 'Breakfast' },
                                            { value: 'Lunch', label: 'Lunch' },
                                            { value: 'Dinner', label: 'Dinner' },
                                            { value: 'Dessert', label: 'Dessert' },
                                            { value: 'Snack', label: 'Snack' },
                                            { value: 'Appetizer', label: 'Appetizer' },
                                            { value: 'Drink', label: 'Drink' },
                                            { value: 'Side', label: 'Side' },
                                            { value: 'Sauce', label: 'Sauce' },
                                            { value: 'Marinade', label: 'Marinade' },
                                        ]}
                                        onChange={addRecipeType}
                                        retrievedSelected={recipe_type}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <span>{recipe_type ? recipe_type.label : ''}</span>
                                    <button onClick={toggleEditRecipeType}>Edit</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
                <div className={'line-separator'}> </div>
                <div className={styles['form-container']}>
                    <ItemForm
                        addRecipeItem={addRecipeItem}
                        recipeDescription={recipe_description}
                        addRecipeDescription={addRecipeDescription}
                        showDescriptionForm={showDescriptionForm}
                        setRecipeDescription={setRecipeDescription}
                    />

                    {recipe_items && recipe_items.length > 0 ? (
                        recipe_items.map((item, index) =>
                            item.isEditing ? (
                                <EditItemForm
                                    key={index}
                                    editRecipeItem={saveRecipeItem}
                                    item={item}
                                />
                            ) : (
                                <Item
                                    recipe_item={item}
                                    key={index}
                                    deleteRecipeItem={deleteRecipeItem}
                                    editRecipeItem={editRecipeItem}
                                />
                            )
                        )
                    ) : (
                        <h1>There are no items in this recipe</h1>
                    )}
                    {showInstructionForm && (
                        <>
                            <div className={'line-separator'}> </div>

                            <div>
                                <InstructionForm addRecipeInstruction={addRecipeInstruction} />

                                {recipe_instructions && recipe_instructions.length > 0 ? (
                                    recipe_instructions.map((instruction, index) =>
                                        instruction.isEditing ? (
                                            <EditInstructionForm
                                                key={index}
                                                editRecipeInstruction={saveRecipeInstruction}
                                                item={instruction}
                                            />
                                        ) : (
                                            <Instruction
                                                recipe_instruction={instruction}
                                                index={index}
                                                deleteRecipeInstruction={deleteRecipeInstruction}
                                                editRecipeInstruction={editRecipeInstruction}
                                            />
                                        )
                                    )
                                ) : (
                                    <h1>There are no instructions in this recipe</h1>
                                )}
                            </div>
                        </>
                    )}

                    <div className={styles['recipe-card-bottom']}> </div>
                </div>
            </div>
        </div>
    );
};
