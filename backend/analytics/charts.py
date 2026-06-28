import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

# Dark Theme styling configurations
BG_COLOR = '#0f172a'      # Slate 900
CARD_BG_COLOR = '#1e293b' # Slate 800
TEXT_COLOR = '#f8fafc'    # Slate 50
ACCENT_1 = '#06b6d4'      # Cyan 500
ACCENT_2 = '#ec4899'      # Pink 500
ACCENT_3 = '#eab308'      # Yellow 500
GRID_COLOR = '#475569'    # Slate 600

def apply_dark_theme(fig, ax):
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(CARD_BG_COLOR)
    ax.spines['bottom'].set_color(GRID_COLOR)
    ax.spines['top'].set_color(GRID_COLOR)
    ax.spines['left'].set_color(GRID_COLOR)
    ax.spines['right'].set_color(GRID_COLOR)
    ax.xaxis.label.set_color(TEXT_COLOR)
    ax.yaxis.label.set_color(TEXT_COLOR)
    ax.tick_params(colors=TEXT_COLOR, which='both')
    ax.title.set_color(TEXT_COLOR)
    ax.grid(True, color=GRID_COLOR, linestyle='--', alpha=0.5)

def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=120, facecolor=fig.get_facecolor(), edgecolor='none')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_str

def generate_player_comparison_chart(p1_name, p1_bat, p2_name, p2_bat):
    # Compare batting metrics: Runs, SR, Avg, Fifties, Sixes
    labels = ['Runs', 'Strike Rate', 'Average', 'Fifties', 'Sixes']
    
    # We will normalize metrics to a 0-100 scale for plotting comparison
    # Heuristics for max limits to scale
    max_vals = [8000, 200, 60, 50, 400] 
    
    val1 = [
        p1_bat.get('runs', 0),
        p1_bat.get('strike_rate', 0),
        p1_bat.get('average', 0),
        p1_bat.get('fifties', 0),
        p1_bat.get('sixes', 0)
    ]
    
    val2 = [
        p2_bat.get('runs', 0),
        p2_bat.get('strike_rate', 0),
        p2_bat.get('average', 0),
        p2_bat.get('fifties', 0),
        p2_bat.get('sixes', 0)
    ]
    
    # Normalize
    norm1 = [(v / m) * 100 for v, m in zip(val1, max_vals)]
    norm2 = [(v / m) * 100 for v, m in zip(val2, max_vals)]
    
    num_vars = len(labels)
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    angles += angles[:1]
    norm1 += norm1[:1]
    norm2 += norm2[:1]
    
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(CARD_BG_COLOR)
    
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)
    
    # Draw one axe per variable + add labels
    plt.xticks(angles[:-1], labels, color=TEXT_COLOR, size=10)
    
    # Draw ylabels
    ax.set_rlabel_position(0)
    plt.yticks([25, 50, 75, 100], ["25%", "50%", "75%", "100%"], color=GRID_COLOR, size=7)
    plt.ylim(0, 100)
    
    # Plot player 1
    ax.plot(angles, norm1, color=ACCENT_1, linewidth=2, linestyle='solid', label=p1_name)
    ax.fill(angles, norm1, color=ACCENT_1, alpha=0.3)
    
    # Plot player 2
    ax.plot(angles, norm2, color=ACCENT_2, linewidth=2, linestyle='solid', label=p2_name)
    ax.fill(angles, norm2, color=ACCENT_2, alpha=0.3)
    
    # Styling
    ax.grid(color=GRID_COLOR, linestyle='--', alpha=0.5)
    ax.tick_params(colors=TEXT_COLOR)
    legend = plt.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1), frameon=True, facecolor=CARD_BG_COLOR, edgecolor=GRID_COLOR)
    for text in legend.get_texts():
        text.set_color(TEXT_COLOR)
        
    plt.title(f"{p1_name} vs {p2_name} Batting Comparison", color=TEXT_COLOR, size=14, weight='bold', pad=20)
    
    return fig_to_base64(fig)

def generate_venue_split_chart(venue_name, pace_w, spin_w):
    labels = ['Pace Wickets', 'Spin Wickets']
    sizes = [pace_w, spin_w]
    colors = [ACCENT_1, ACCENT_2]
    
    fig, ax = plt.subplots(figsize=(5, 5))
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(CARD_BG_COLOR)
    
    if pace_w == 0 and spin_w == 0:
        ax.text(0.5, 0.5, 'No Wicket Data Available', color=TEXT_COLOR, ha='center', va='center')
        ax.axis('off')
    else:
        wedges, texts, autotexts = ax.pie(
            sizes, 
            labels=labels, 
            autopct='%1.1f%%',
            startangle=90, 
            colors=colors, 
            textprops=dict(color=TEXT_COLOR),
            wedgeprops=dict(width=0.4, edgecolor=BG_COLOR, linewidth=2) # Doughnut style
        )
        for autotext in autotexts:
            autotext.set_color(BG_COLOR)
            autotext.set_weight('bold')
            
        ax.axis('equal')  
        
    plt.title(f"{venue_name} - Pace vs Spin Wickets Split", color=TEXT_COLOR, size=12, weight='bold', pad=10)
    return fig_to_base64(fig)

def generate_match_progression_chart(prog_data):
    # prog_data: dict from get_run_rate_progression
    fig, ax = plt.subplots(figsize=(8, 4.5))
    apply_dark_theme(fig, ax)
    
    team1 = prog_data.get('team1', 'Innings 1')
    team2 = prog_data.get('team2', 'Innings 2')
    
    inn1 = prog_data.get('innings1', [])
    inn2 = prog_data.get('innings2', [])
    
    overs = list(range(1, 21))
    
    # Cumulative runs
    cum1 = [x['cum_runs'] for x in inn1]
    cum2 = [x['cum_runs'] for x in inn2]
    
    # Truncate to length of overs if needed
    len1 = min(len(cum1), 20)
    len2 = min(len(cum2), 20)
    
    ax.plot(overs[:len1], cum1[:len1], color=ACCENT_1, marker='o', linewidth=2.5, label=f"{team1}")
    ax.plot(overs[:len2], cum2[:len2], color=ACCENT_2, marker='s', linewidth=2.5, label=f"{team2}")
    
    # Highlight wickets
    for i, x in enumerate(inn1[:len1]):
        if i > 0 and inn1[i]['cum_wickets'] > inn1[i-1]['cum_wickets']:
            ax.scatter(overs[i], x['cum_runs'], color='#ef4444', s=100, zorder=5, marker='x')
    for i, x in enumerate(inn2[:len2]):
        if i > 0 and inn2[i]['cum_wickets'] > inn2[i-1]['cum_wickets']:
            ax.scatter(overs[i], x['cum_runs'], color='#ef4444', s=100, zorder=5, marker='x', label='Wicket' if i == 1 else "")
            
    ax.set_xlabel("Overs", fontsize=10)
    ax.set_ylabel("Runs", fontsize=10)
    ax.set_xticks(range(1, 21))
    
    legend = ax.legend(frameon=True, facecolor=CARD_BG_COLOR, edgecolor=GRID_COLOR)
    for text in legend.get_texts():
        text.set_color(TEXT_COLOR)
        
    plt.title(f"Match Progression: {team1} vs {team2}", color=TEXT_COLOR, size=13, weight='bold', pad=15)
    
    return fig_to_base64(fig)

def generate_toss_impact_chart(toss_data):
    fig, ax = plt.subplots(figsize=(6, 4))
    apply_dark_theme(fig, ax)
    
    categories = ['Bat First Wins', 'Field First Wins']
    values = [toss_data.get('bat_first_wins', 0), toss_data.get('field_first_wins', 0)]
    colors = [ACCENT_1, ACCENT_3]
    
    bars = ax.bar(categories, values, color=colors, edgecolor=GRID_COLOR, width=0.5)
    
    # Add values on top of bars
    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 0.5, str(yval), ha='center', va='bottom', color=TEXT_COLOR, fontweight='bold')
        
    ax.set_ylabel("Matches Won", fontsize=10)
    plt.title("Venue Toss Winner Win Decision Impact", color=TEXT_COLOR, size=12, weight='bold', pad=15)
    
    return fig_to_base64(fig)
