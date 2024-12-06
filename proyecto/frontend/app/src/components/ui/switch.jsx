export function Switch({ checked, onCheckedChange }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <div className="group peer bg-white rounded-full duration-300 w-10 h-5 ring-2 ring-red-500 after:duration-300 after:bg-red-500 peer-checked:after:bg-green-500 peer-checked:ring-green-500 after:rounded-full after:absolute after:h-4 after:w-4 after:top-0.5 after:left-0.5 after:flex after:justify-center after:items-center peer-checked:after:translate-x-5 peer-hover:after:scale-95"></div>        </label>
    );
    }