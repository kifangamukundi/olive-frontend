export function IconViewDashboard(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        height="2em"
        width="2em"
        {...props}
      >
        <title>{props.title}</title>
        <path d="M13 3v6h8V3m-8 18h8V11h-8M3 21h8v-6H3m0-2h8V3H3v10z" />
      </svg>
    );
  }