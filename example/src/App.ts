import {
    Element, Store, Fragment
} from '../../dist';
import { Button, Input } from './uikit';
import { generateUUID } from './utils';
import Icon from './uikit/Icon';

interface Todo {
    id: string;
    title: string;
}

function App() {
    const store = new Store<Todo[]>([]);
    const value = new Store<string | undefined>(undefined);

    const onSave = () => {
        if (!value.GetState()) {
            window.alert('Input is empty.');
            return;
        } else {

            store.SetState((prev) => ([
                {
                    title: value.GetState() as string,
                    id: generateUUID(),
                }, ...prev
            ]));

            value.SetState(undefined);
        }
    };

    const onChangeInput = (_e: Event, text: string) => {
        value.SetState(text);
    };

    const save = new Button({
        variant: 'primary',
        className: 'end_content_button',
        children: ['Save'],
        onPress: onSave,
    })

    const textfield = new Input({
        name: 'example-input',
        endContent: save.dom,
        placeholder: 'Add todo.',
        onInput: onChangeInput,
    });

    value.Effect((state) => {
        textfield.input.SetProps({
            value: state,
        });

        save.SetProps({
            disabled: !state?.length
        })
    });

    const ol = new Element<HTMLOListElement>('ol',{
            id: 'list_container',
            children: [],
    });

    store.Effect((state) => {
        ol.SetProps({
            children: state.length
                ? state.map((item) => {
                    return (
                        new Element<HTMLLIElement>('li',{
                                className: 'squircle-26',
                                key: item.id,
                                children: [
                                    item.title, new Button({
                                        variant: 'error',
                                        className: 'squircle-26',
                                        children: [
                                            new Icon('Trash', {
                                                size: 16,
                                            }).dom
                                        ],
                                        onPress: () => {
                                            store.SetState(prev => prev.filter(e => e.id !== item.id));
                                        },
                                    }).dom
                                ],
                        }).dom
                    );
                })
                : [
                    new Element<HTMLSpanElement>('span',{
                            children: ['Todos does not exists!'],
                    }).dom
                ],
        });
    });

    return (
        Fragment([
            new Element<HTMLHeadingElement>('h1',{
                    children: ['Nuvo todo example.'],
            }).dom,

            new Element<HTMLDivElement>('div',{
                    className: 'row',
                    children: [textfield.dom],
            }).dom,

            ol.dom
        ])
    );
}

export default App;
