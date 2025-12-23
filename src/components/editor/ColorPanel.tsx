export const ColorPanel = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-400 block mb-2">Primary</label>
        <input
          type="color"
          defaultValue="#00D4E5"
          className="w-full h-10 rounded border border-border cursor-pointer"
        />
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-2">Accent</label>
        <input
          type="color"
          defaultValue="#00BFA6"
          className="w-full h-10 rounded border border-border cursor-pointer"
        />
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-2">Highlight</label>
        <input
          type="color"
          defaultValue="#00BFA6"
          className="w-full h-10 rounded border border-border cursor-pointer"
        />
      </div>
    </div>
  );
};
