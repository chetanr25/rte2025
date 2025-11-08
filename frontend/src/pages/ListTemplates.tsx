import { Link } from "react-router-dom"

function ListTemplates() {
    return (
        <div className="">
            <Link to="/dashboard/form-templates/create">
                <button>
                    Create New Template
                </button>
            </Link>
        </div>
    )
}

export default ListTemplates