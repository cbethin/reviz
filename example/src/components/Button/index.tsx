import styled from "styled-components"

interface ButtonProps {
    text?: string
}

const CustomButton = styled.button`
    border: none;
    background-color: lightblue;
    border-radius: 12px;
    padding: 20px;
    font-size: 0.8rem;

    &:hover {
        filter: brightness(90%);
        cursor: pointer;
    }
`

export default function Button(props: ButtonProps) {
    return <CustomButton>
        {props.text}
    </CustomButton>
}