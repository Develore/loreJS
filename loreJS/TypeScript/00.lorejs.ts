
module lorejs
{

	/**
	Gets the given proeprty from the given source object. This method recognizes any dots ('.') in the name and traverses
	the given object's child properties to find the value. For instance, if the property name is 'employee.firstName', then
	this method looks for a property called 'employee' on the given source. If such a property exists, then that child
	object is search to find a property called 'firstName'.
	*/
	export function getProperty(source: any, propertyName: string): any
	{
		if (!source || !propertyName) return;
		var arr = propertyName.split(".");

		if (!arr || !arr.length) return;



		var getter = function (parent: any, nameArr: string[], index: number): any
		{
			if (index < nameArr.length - 1)
			{
				var child = parent[nameArr[index]];
				if (child)
				{
					return getter(child, nameArr, index + 1);
				}
			}
			else
			{
				return parent[nameArr[index]];
			}
		};

		return getter(source, arr, 0);
	}

	/**
	Sets the property with the given name on the given target object. If the name contains dots ('.'), then the name is 
	considered to refer to a child object of the target instead of a property directly on the target with just a dot in 
	its name.
	*/
	export function setProperty(target: any, propertyName: string, value: any): void
	{
		if (!target || !propertyName) return;
		var arr = propertyName.split(".");
		if (!arr || !arr.length) return;

		var setter = function (parent: any, nameArr: string[], index: number)
		{
			if (index < nameArr.length - 1)
			{
				var child = parent[nameArr[index]];
				if (!child)
				{
					child = {};
					parent[nameArr[index]] = child;
				}

				setter(child, nameArr, index + 1);
			}
			else
			{
				parent[nameArr[index]] = value;
			}
		};

		setter(target, arr, 0);
	}


	/** Parses the given input string into a IUri object. */
	export function parseUri(input?: string): lorejs.IUri
	{
		var o = parseUri["options"],
			m = o.parser[o.strictMode ? "strict" : "loose"].exec(input),
			uri = {},
			i = 14;

		while (i--) uri[o.key[i]] = m[i] || "";

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2)
		{
			if ($1) uri[o.q.name][$1] = $2;
		});

		return uri;
	}

	parseUri["options"] = {
		strictMode: false,
		key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
		q: {
			name: "queryKey",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};

	/** Creates a time span object from the input string. The input should be formatted as the string returned by the 'lorejs.ITimeSpan.toString()' method. */
	export function timeSpan(input?: string): lorejs.ITimeSpan;

	/** Creates a time span object from the given parameters. */
	export function timeSpan(days?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): lorejs.ITimeSpan;

	export function timeSpan(daysOrInput?: any, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): lorejs.ITimeSpan
	{
		var ts = new TimeSpan();

		if (typeof daysOrInput === "string")
		{
			if (daysOrInput)
			{
				ts = parseTimeSpanString(daysOrInput);
			}
		}
		else
		{
			if (daysOrInput) ts.days = daysOrInput;
			if (hours) ts.hours = hours;
			if (minutes) ts.minutes = minutes;
			if (seconds) ts.seconds = seconds;
			if (milliseconds) ts.milliseconds = milliseconds;
		}

		return ts;
	}


	function parseTimeSpanString(input: string): ITimeSpan
	{
		var ts = new TimeSpan();

		var arr: string[];

		arr = input.match(/\d+\./);
		if (arr && arr.length)
		{
			var d = arr[0].substr(0, arr[0].length - 1).toNumber();
			if (!isNaN(d)) ts.days = d;

			input = input.substr(arr[0].length);
		}

		arr = input.match(/\.\d+/);
		if (arr && arr.length)
		{
			var ms = arr[0].substr(1).toNumber();
			if (!isNaN(ms)) ts.milliseconds = ms;

			input = input.substr(0, input.length - arr[0].length);
		}

		// OK, so now we have stripped away both days and milliseconds, so what
		// we have left is a string with HH:mm:ss. If the string contains no colons,
		// we assume that the string is a number and that it represents the minutes.
		// If the string contains one colon, we assume that it contains hours and minutes,
		// and if the string contains 2 colons, the string is assumed to contain hours,
		// minutes and seconds. If the string contains more than 2 colons, then we must
		// skip the time processing alltogether.
		arr = input.match(/\:/g);
		var colonCount = arr && arr.length ? arr.length : 0;

		var setHours = function(hh: string): void
		{
			var hhNum = hh.toNumber();
			if (!isNaN(hhNum)) ts.hours = hhNum;
		};
		var setMinutes = function(mm: string): void
		{
			var mmNum = mm.toNumber();
			if (!isNaN(mmNum)) ts.minutes = mmNum;
		};

		if (colonCount == 0)
		{
			var mm = input.toNumber();
			if (!isNaN(mm)) ts.minutes = mm;
		}
		else if (colonCount == 1)
		{
			var tArr = input.split(":");
			setHours(tArr[0]);
			setMinutes(tArr[1]);
		}
		else if (colonCount == 2)
		{
			var tArr = input.split(":");
			setHours(tArr[0]);
			setMinutes(tArr[1]);

			var ss = tArr[2].toNumber();
			if (!isNaN(ss)) ts.seconds = ss;
		}

		return ts;
	}

	class TimeSpan implements ITimeSpan
	{
		constructor()
		{
			this.days = 0;
			this.hours = 0;
			this.minutes = 0;
			this.seconds = 0;
			this.milliseconds = 0;
		}

		days: number;

		hours: number;

		minutes: number;

		seconds: number;

		milliseconds: number;

		totalDays(): number
		{
			return this.totalHours() / 24.0;
		}

		totalHours(): number
		{
			return this.totalMinutes() / 60.0;
		}

		totalMinutes(): number
		{
			return this.totalSeconds() / 60.0;
		}

		totalSeconds(): number
		{
			return this.totalMilliseconds() / 1000.0;
		}

		totalMilliseconds(): number
		{
			return this.milliseconds
				+ (this.seconds * 1000)
				+ (this.minutes * 60 * 1000)
				+ (this.hours * 60 * 60 * 1000)
				+ (this.days * 24 * 60 * 60 * 1000);
		}

		toString(): string
		{
			var mainArr: string[] = [];
			var s: string;

			if (this.days) mainArr.push("" + this.days);

			if (this.hours || this.minutes || this.seconds || this.milliseconds)
			{
				var arr: string[] = [];
				arr.push(("00" + this.hours).right(2));
				arr.push(("00" + this.minutes).right(2));

				if (this.seconds) arr.push(("00" + this.seconds).right(2));

				mainArr.push(arr.join(":"));
			}

			if (this.milliseconds)
			{
				mainArr.push(("000" + this.milliseconds).right(3));
			}

			return mainArr.join(".");
		}
	}

}