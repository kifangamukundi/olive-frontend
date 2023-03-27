export function IconViewShow(props) {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        height="2em"
        width="2em"
        {...props}
      >
         <title>{props.title}</title>
        <path d="M.2 10a11 11 0 0119.6 0A11 11 0 01.2 10zm9.8 4a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    );
  }